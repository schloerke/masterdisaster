(function() {
  $(function() {
    var allow_increment, chart, collection, increment_time, path, status, timeMax, timeMin, translate, xy;
    status = {};
    xy = d3.geo.mercator().scale(1200);
    translate = xy.translate();
    translate[0] = 450;
    translate[1] = 285;
    xy.translate(translate);
    chart = d3.select("#canvas").append("svg:svg");
    path = d3.geo.path().projection(xy);
    timeMin = 1900;
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
    $("#scale").slider({
      min: timeMin,
      max: timeMax,
      value: 500,
      step: 1,
      slide: function(event, ui) {
        return time.set(ui.value).notify();
      }
    });
    $("#play").click(function() {
      return play();
    });
    $("#pause").click(function() {
      return pause();
    });
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
    window.gdp = dvl.json2({
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
            rgdpch: row.rgdpch === "na" ? 0 : row.rgdpch
          };
        }
        return newGdp;
      }
    });
    window.yearData = dvl.apply({
      args: [gdp, time],
      fn: function(g, t) {
        return g[t];
      }
    });
    window.all = dvl.json2({
      url: "/all",
      fn: function(d) {
        var good, makeDate, obj, ret, row, rows, start, _i, _j, _len, _len2, _name;
        makeDate = function(dt) {
          var y;
          dt = "" + dt;
          y = dt.substring(dt.length - 4);
          return parseInt(y, 10);
        };
        rows = d.rows;
        good = 0;
        obj = [];
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          start = makeDate(row.Start);
          obj.push({
            start: start,
            country: row.Country,
            killed: row.Killed,
            affected: row.Affected || 0,
            type: row.Sub_Type || row.Type
          });
        }
        ret = {};
        for (_j = 0, _len2 = obj.length; _j < _len2; _j++) {
          row = obj[_j];
          ret[_name = row.start] || (ret[_name] = []);
          ret[row.start].push(row);
        }
        return ret;
      }
    });
    window.get_all = function() {
      var a, i, t, year, yearVal;
      a = all.get();
      t = {};
      i = 0;
      for (year in a) {
        yearVal = a[year];
        i++;
        if (i > 5) {
          break;
        }
        t[year] = yearVal;
      }
      return t;
      return null;
    };
    return window.yearAll = dvl.apply({
      args: [all, time],
      fn: function(a, t) {
        return a[t];
      }
    });
  });
}).call(this);
