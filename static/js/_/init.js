(function() {
  $(function() {
    var allow_increment, chart, collection, i, increment_time, path, status, time, timeMax, timeMin, xy;
    status = {};
    xy = d3.geo.mercator().scale(1200);
    chart = d3.select("#canvas").append("svg:svg");
    path = d3.geo.path().projection(xy);
    timeMin = 1950;
    timeMax = 2010;
    time = dvl.def(timeMin, "time");
    allow_increment = dvl.def(false, "allow_increment");
    dvl.html.out({
      selector: "#scale_label",
      data: time,
      format: function(d) {
        return d;
      }
    });
    increment_time = function() {
      var t;
      t = time.get();
      if (t === timeMax) {
        return pause();
      } else {
        t += 1;
        return time.set(t).notify();
      }
    };
    window.play = function() {
      status.interval = setInterval(increment_time, 1000);
      return null;
    };
    window.pause = function() {
      status.interval = clearInterval(status.interval);
      return null;
    };
    dvl.register({
      listen: [time],
      fn: function() {
        var t;
        t = time.get();
        $("#scale").slider("option", "value", t);
        return null;
      }
    });
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
    $("#scale").slider({
      min: timeMin,
      max: timeMax,
      value: 500,
      step: 1,
      slide: function(event, ui) {
        return time.set(ui.value).notify();
      }
    });
    return instrument_graph({
      data: data,
      selector: '#time_graph',
      type: 'line',
      whats: ['total'],
      humanize: false,
      rawPadding: rawPadding,
      duration: duration
    });
  });
}).call(this);
