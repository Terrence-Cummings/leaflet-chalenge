const queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
var link = "static/data/plates.geojson";

// Perform an API call to the USGS earthquake JSON data endpoint
d3.json(queryUrl, function(data1) {
    d3.json(link, function(data2) {
        createFeatures(data1.features, data2.features);
    });
});

// Grabbing our GeoJSON data..
// d3.json(link, function(data) {
//     var plates = L.geoJson(data.features, {
//         // Passing in our style object
//         // style: mapStyle
//     });
//     console.log(plates);
// });

function getColor(d) {
    dTrunc = Math.trunc(d);
    if (dTrunc === 0)
        return "#AED45C";
    if (dTrunc === 1)
        return "#EDDE52";
    if (dTrunc === 2)
        return "#FFC300";
    if (dTrunc === 3)
        return "#FF8D18";
    if (dTrunc === 4)
        return "#FF5733";
    if (dTrunc > 4)
        return "#C70438";
}

function createFeatures(earthquakeData, plateData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
            "</h3><hr>Magnitude: " + feature.properties.mag);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circle(latlng, {
                fillOpacity: 0.75,
                weight: 1,
                color: "white",
                fillColor: getColor(feature.properties.mag),
                // Adjust radius
                radius: feature.properties.mag * 15000
            });
        },
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    plates = plateData;
    createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {
    console.log(plates);
    // Define streetmap and darkmap layers
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-streets-v9",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellitemap,
        "Grayscale": lightmap,
        "Outdoors": outdoorsmap
    };

    plateLayer = L.geoJson(plates, {
        style: function(feature) {
            return {
                color: "orange",
                fillOpacity: 0.0,
                weight: 1.5
            };
        }
    })

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Fault Lines": plateLayer,
        "Earthquakes": earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            40.7608, -111.8910
        ],
        zoom: 5,
        layers: [satellitemap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend');
        labels = ['<strong>Magnitude</strong>'],
            categories = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];

        for (var i = 0; i < categories.length; i++) {

            div.innerHTML +=
                labels.push(
                    '<li class="circle" style="background:' + getColor(i) + '"></li> ' +
                    (categories[i] ? categories[i] : '+'));
            console.log(categories[i]);
            console.log(getColor(i));

        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);

    xxx = myMap.hasLayer(earthquakes);
    console.log(xxx);




}