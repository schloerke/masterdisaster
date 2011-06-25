(function() {
  var chart, path, xy;
  console.log('eur');
  xy = d3.geo.mercator().scale(1200);
  chart = d3.select("body").append("svg:svg");
  path = d3.geo.path().projection(xy);
  d3.json("/map", function(collection) {
    return chart.selectAll("path").data(collection.features).enter().append("svg:path").attr("d", path).append("svg:title").text(function(d) {
      return d.properties.name;
    });
  });
}).call(this);
