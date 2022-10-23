// init map
let myMap = L.map("map", {
    center: [37.8283, -96.5795],
    zoom: 5});
  
// add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(myMap);

// define link
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// used to convert depth to color: color -> f(depth)
function depthToColor(depth) {
  function fn(x) {return 1/(1+Math.exp(2.2*(.9-x/25)))}
  let red = 255*fn(depth);
  let green = 255-255*fn(depth);
  let blue = 50;
  return `rgb(${red} ,${green} , ${blue})`;};

// used to convert magnitude to radius: radius -> g(magnitude)
function magToRadius(mag) {
  return 10*Math.sqrt(Math.abs(mag))};

// styyles feature: color -> f(depth), radius -> g(magnitude)
function style(feature) {
  let depth = feature.geometry.coordinates[2];
  let mag = feature.properties.mag;
  return {
  radius: magToRadius(mag),
  fillColor: depthToColor(depth),
  color: 'black',
  weight: .3,
  opacity: 1,
  fillOpacity: 0.5};}

// fills in popup text for selected feature
function popupText(feature) {
  let place = feature.properties.place;
  let mag = feature.properties.mag;
  let url = feature.properties.url;
  let time = Date(feature.properties.time).toLocaleString();
  return `<h5>Earthquake!</h5><hr></hr><p>This earthquake occurred on ${time}, ${place}, with a magnitude of ${mag}. More info can be found <a href="${url}">here</a>.</p>`;
};

// call data
d3.json(link).then(function(earthquakes) {

  // add geojason layer
  L.geoJson(earthquakes, {
    pointToLayer: function (feature, latlng) {
      return L
        .circleMarker(latlng, style(feature))
        .bindPopup(popupText(feature))}})
        .addTo(myMap);});

  // Set up the legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [...Array(111).keys()].map(depth => depth - 10)
    let colors = depths.map(depth=>depthToColor(depth))
    let labels = [];

    // Add the minimum and maximum
    let legendInfo = "<h4>Depth of Earthquake (km)</h4>" +
      `<div class="labels"><div class="min">${depths[0]}</div><div class="max">${depths[depths.length-1]}</div></div>`;

    div.innerHTML = legendInfo;

    depths.forEach(function(depth, index) {
      labels.push(`<li style="background-color: ${colors[index]}"></li>`);
    });

    div.innerHTML += `<ul>${labels.join("")}</ul>`;
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);