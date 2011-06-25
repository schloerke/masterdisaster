(function() {
  $(function() {
    var chart, collection, i, path, xy;
    xy = d3.geo.mercator().scale(1200);
    chart = d3.select("#canvas").append("svg:svg");
    path = d3.geo.path().projection(xy);
    collection = dvl.json2({
      url: "/map",
      fn: function(data) {
        return data;
      }
    });
    dvl.register({
      listen: [collection],
      fn: function() {
        var col;
        col = collection.get();
        if (!(col != null)) {
          return null;
        }
        chart.selectAll("path").data(col.features).enter().append("svg:path").attr("d", path).append("svg:title").text(function(d) {
          return d.properties.name;
        });
        return null;
      }
    });
    i = 0;
    return $("#scale").slider({
      min: 0,
      max: 3000,
      value: 500,
      step: 1,
      slide: function(event, ui) {
        null;        return console.log("oh hai! - " + (i++));
      }
    });
  });
}).call(this);
