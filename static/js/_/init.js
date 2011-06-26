(function() {
  $(function() {
    var allow_increment, chart, collection, gdptemp, i, increment_time, path, status, timeMax, timeMin, translate, xy;
    status = {};
    xy = d3.geo.mercator().scale(1200);
    translate = xy.translate();
    translate[0] = 450;
    translate[1] = 285;
    xy.translate(translate);
    chart = d3.select("#canvas").append("svg:svg");
    path = d3.geo.path().projection(xy);
    timeMin = 1950;
    timeMax = 2010;
    window.time = dvl.def(timeMin, "time");
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
      url: "/map"
    });
    gdptemp = dvl.json2({
      url: "/gdp",
      fn: function(d) {
        var newGdp, row, _i, _len, _name, _ref;
        newGdp = {};
        _ref = d.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          newGdp[_name = row.year] || (newGdp[_name] = {});
          newGdp[row.year][row.country] = {
            country_isocode: row["country isocode"],
            pop: row.POP,
            rgdpch: row.rgdpch
          };
        }
        return newGdp;
      }
    });
    window.gdp = dvl.apply({
      args: [gdptemp, collection],
      fn: function(g, col) {
        var country, countryval, feature, val, year, _i, _len, _ref;
        for (year in g) {
          val = g[year];
          for (country in val) {
            countryval = val[country];
            _ref = col.features;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              feature = _ref[_i];
              if (country === feature.properties.name) {
                countryval.svgObj = feature;
                break;
              }
            }
          }
        }
        return g;
      }
    });
    window.yearData = dvl.apply({
      args: [gdp, time],
      fn: function(g, t) {
        return g[t];
      }
    });
    dvl.register({
      listen: [yearData],
      fn: function() {
        var key, val, yd;
        yd = yearData.get();
        if (!(yd != null)) {
          return null;
        }
        o.ut(true, "yd: ", yd);
        window.svgs = (function() {
          var _results;
          _results = [];
          for (key in yd) {
            val = yd[key];
            _results.push(val.svgObj);
          }
          return _results;
        })();
        chart.selectAll("path").data(svgs).enter().append("svg:path").attr("d", path).append("svg:title").attr("class", "blue").text(function(d) {
          return d.properties.name;
        });
        return null;
      }
    });
    dvl.register({
      listen: [collection],
      fn: function() {
        window.col = collection.get();
        if (!(typeof col !== "undefined" && col !== null)) {
          return null;
        }
        chart.selectAll("path").data(col.features).enter().append("svg:path").attr("d", path).append("svg:title").text(function(d) {
          return d.properties.name;
        });
        return null;
      }
    });
    dvl.register({
      listen: [gdp],
      fn: function() {
        var col;
        col = gdp.get();
        if (!(col != null)) {
          return null;
        }
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
    $("#play").click(play);
    return $("#pause").click(pause);
  });
}).call(this);
