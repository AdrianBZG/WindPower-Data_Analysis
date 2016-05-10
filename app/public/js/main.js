
var map = L.map('map').setView([37.8, -96], 4);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    var stateInfo = getStateInfo(props ? props.NAME : 0);

    if (stateInfo)
      var all = "<b>State: </b>" + stateInfo["State"] + "<br>" +
              "<b>Land: </b>" + stateInfo["Land km2"] + " km² <br>" +
              "<b>Forest Cover: </b>" + stateInfo["Forest Cover (%)"] + " % <br>" +
              "<b>Average Temp: </b>" + stateInfo["Average Temp (C)"] + " C <br>" +
              "<b>Average elevation: </b>" + stateInfo["Average elevation"] + " m <br>" +
              "<b>Difference elevation: </b>" + stateInfo["Difference elevation"] + " m <br>" +
              "<b>Public land: </b>" + stateInfo["% that is Public Land"] + " %<br>" +
              "<b>Average Wind Speed: </b>" + stateInfo["Average Wind Speed (mph)"] + " mph <br>" +
              "<b>Nuclear Production: </b>" + stateInfo["Nuclear Year to Date (MW"]["h)"] + " MWh<br>";
              //"h)": 41951382
    this._div.innerHTML = '<h4>Información' + (props ?
                                                              '<b> ' + props.NAME + '</h4></b><br/>' + all
                                                              : 'Mantegan el ratón sobre un estado');
};


function getStateInfo (state) {
  for (var i in windPowerData) {
    console.log(windPowerData[i]);
    if (windPowerData[i]["State"] == state) {
      return windPowerData[i];
    }
  }
}


info.addTo(map);



// get color depending on population density value
function getColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
        d > 100 ? '#FC4E2A' :
        d > 50 ? '#FD8D3C' :
        d > 20 ? '#FEB24C' :
        d > 10 ? '#FED976' :
        '#FFEDA0';
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
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
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
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
