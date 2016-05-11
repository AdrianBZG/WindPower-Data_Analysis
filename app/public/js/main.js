
var map = L.map('map').setView([37.8, -96], 4);

var mapboxAccessToken = "pk.eyJ1IjoiZWxlYXphcmRkIiwiYSI6ImNpbnZ0eDF3ZDAwbnZ3N2tsdTU2eWl1bGUifQ.bv7o-Y34GZPHIgDJmN94rg";

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light'
}).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    var stateInfo = getStateInfo(props ? props.NAME : 0);

    if (stateInfo) {
        var possibleExtraWindProd = calculateWindEnergyProduction (stateInfo);
        var all = "<b>State: </b>" + stateInfo["State"] + "<br>" +
                "<b>Land: </b>" + stateInfo["Land km2"] + " km² <br>" +
                "<b>Forest Cover: </b>" + stateInfo["Forest Cover (%)"] + " % <br>" +
                "<b>Average Temp: </b>" + stateInfo["Average Temp (C)"] + " C <br>" +
                "<b>Average elevation: </b>" + stateInfo["Average elevation"] + " m <br>" +
                "<b>Difference elevation: </b>" + stateInfo["Difference elevation"] + " m <br>" +
                "<b>Public land: </b>" + stateInfo["% that is Public Land"] + " %<br>" +
                "<b>Average Wind Speed: </b>" + stateInfo["Average Wind Speed (mph)"] + " mph <br>" +
                "<b>Nuclear Production: </b>" + stateInfo["Nuclear Year to Date (MW"]["h)"] + " MWh<br>" +
                "<b>Possible Extra Wind Prod.: </b>" + possibleExtraWindProd[0] + " MW <br>" +
                "<b> Nuclear Energy Saving: </b>" + possibleExtraWindProd[1] + " MW <br>";

    }
    this._div.innerHTML = '<h4>Información' + (props ?
                                               '<b> ' + props.NAME + '</h4></b><br/>' + all
                                               : '<br>Mantegan el ratón sobre un estado');
};


function getStateInfo (state) {
    for (var i in windPowerData) {
        //console.log(windPowerData[i]);
        if (windPowerData[i]["State"] == state) {
            return windPowerData[i];
        }
    }
}

function calculateWindEnergyProduction (stateInfo) {
    if (stateInfo) {
        var tDisp = stateInfo["Land km2"] - (stateInfo["Land km2"] * (stateInfo["% that is Public Land"] / 100));     // km² disponibles
        const pMed = 62.55;
        const pEpe = 308.3715;             // producción por parque eólico en KWh.
        const ePe = 40;                    // Extensión media de un parque eólico en km².
        var cPe = tDisp / ePe;
        var posProd = cPe * pEpe * 24;   // Posible producción anual de energía eólica, es decir del viento.
        var currentAnnualProd = stateInfo["Installed Wind Capacity (MW)"];
        var posEnergy = posProd - currentAnnualProd;
        var currentAnnualNuclearProd = stateInfo["Nuclear Year to Date (MW"]["h)"];
        var nuclearEnergySave = currentAnnualNuclearProd - posEnergy;

        var result = [posEnergy, Math.abs(nuclearEnergySave)];
        return result;
    }
}


info.addTo(map);



// get color depending on population density value
function getColor(d) {
    return d > 150000000 ? '#800026' :
        d > 110000000 ? '#BD0026' :
        d > 80000000 ? '#E31A1C' :
        d > 60000000 ? '#FC4E2A' :
        d > 40000000 ? '#FD8D3C' :
        d > 20000000 ? '#FEB24C' :
        d > 0 ? '#FED976' :
        '#FFEDA0';
}

var mayor = 0;
var menor = 999999999;

function style(feature) {
    var result = calculateWindEnergyProduction(getStateInfo(feature.properties.NAME ? feature.properties.NAME : null));
    if (result) {
        result = result[0];
        if (result > mayor)
            mayor = result;
        if (result < menor)
            menor = result;
    }
    console.log("Mayor: " + mayor + " y menor: " + menor);
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(result)
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 20000000, 40000000, 60000000, 80000000, 110000000, 150000000, 200000000],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
                from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);
