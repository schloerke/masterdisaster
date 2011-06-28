(function() {
  var all, allTimeData, allow_increment, allt, clusX, clusY, get_all, increment_time, kOrA, maxCountries, maxDisasters, maxVals, path, status, time, timeMax, timeMin, translate, xy, yearAll;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  status = {};
  xy = d3.geo.mercator().scale(1200);
  translate = xy.translate();
  translate[0] = 450;
  translate[1] = 285;
  xy.translate(translate);
  path = d3.geo.path().projection(xy);
  timeMin = 1900;
  timeMax = 2008;
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
    t += 1;
    time.set(t).notify();
    if (t === timeMax) {
      pause();
    }
    return null;
  };
  window.play = function() {
    var reset;
    if (!((status.playing != null) && status.playing === true)) {
      reset = false;
      if (time.get() === timeMax) {
        reset = true;
        time.set(timeMin).notify();
      }
      status.interval = setInterval(increment_time, 1000);
      if (!reset) {
        increment_time();
      }
      status.playing = true;
    }
    return null;
  };
  window.pause = function() {
    status.interval = clearInterval(status.interval);
    status.playing = false;
    null;
    return dvl.register({
      listen: [time],
      fn: function() {
        var t;
        t = time.get();
        $("#scale").slider("option", "value", t);
        return null;
      }
    });
  };
  allt = dvl.json2({
    url: "/all",
    fn: function(d) {
      var good, makeDate, obj, ret, row, rows, seen, start, t, _i, _j, _len, _len2, _name, _name2;
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
        t = {
          start: start,
          country: row.Country || "Country",
          cost: row.Cost || 1,
          killed: row.Killed || 1,
          affected: row.Affected || 1,
          type: (row.Sub_Type || row.Type).toLowerCase()
        };
        t.key = "" + t.type + "_" + t.country;
        obj.push(t);
      }
      ret = {};
      seen = {};
      for (_j = 0, _len2 = obj.length; _j < _len2; _j++) {
        row = obj[_j];
        seen[_name = row.start] || (seen[_name] = {});
        ret[_name2 = row.start] || (ret[_name2] = []);
        if (!seen[row.start][row.key]) {
          seen[row.start][row.key] = true;
          ret[row.start].push(row);
        }
      }
      return ret;
    }
  });
  all = dvl.apply({
    args: allt,
    fn: function(as) {
      var found, k, newCountryVal, nowCountryVal, nowYearVal, prevCountryVal, prevYearVal, v, year, _i, _j, _len, _len2;
      for (year = timeMin; timeMin <= timeMax ? year <= timeMax : year >= timeMax; timeMin <= timeMax ? year++ : year--) {
        nowYearVal = as[year];
        prevYearVal = as[year - 1];
        if ((prevYearVal != null) && nowYearVal) {
          for (_i = 0, _len = prevYearVal.length; _i < _len; _i++) {
            prevCountryVal = prevYearVal[_i];
            found = false;
            for (_j = 0, _len2 = nowYearVal.length; _j < _len2; _j++) {
              nowCountryVal = nowYearVal[_j];
              if (nowCountryVal.country === prevCountryVal.country) {
                found = true;
                nowCountryVal.killed = nowCountryVal.killed;
              }
            }
            if (!found) {
              newCountryVal = {};
              for (k in prevCountryVal) {
                v = prevCountryVal[k];
                newCountryVal[k] = v;
              }
              newCountryVal.killed = newCountryVal.killed * 0.00001;
              newCountryVal.cost = newCountryVal.cost * 0.00001;
              newCountryVal.affected = newCountryVal.affected * 0.00001;
              nowYearVal.push(newCountryVal);
            }
          }
        }
      }
      return as;
    }
  });
  get_all = function() {
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
  maxCountries = dvl.apply({
    args: [all],
    fn: function(al) {
      var countryObj, k, max, t, tmp, v, year, yearVal, _i, _len;
      max = {};
      for (year in al) {
        yearVal = al[year];
        for (_i = 0, _len = yearVal.length; _i < _len; _i++) {
          countryObj = yearVal[_i];
          if (max[countryObj.country] != null) {
            max[countryObj.country]++;
          } else {
            max[countryObj.country] = 1;
          }
        }
      }
      t = ((function() {
        var _results;
        _results = [];
        for (k in max) {
          v = max[k];
          _results.push({
            country: k,
            count: v
          });
        }
        return _results;
      })()).sort(function(a, b) {
        return b.count - a.count;
      });
      return ((function() {
        var _j, _len2, _results;
        _results = [];
        for (_j = 0, _len2 = t.length; _j < _len2; _j++) {
          tmp = t[_j];
          _results.push(tmp.country);
        }
        return _results;
      })()).slice(0, 40);
    }
  });
  maxDisasters = dvl.apply({
    args: [all],
    fn: function(al) {
      var countryObj, k, max, t, tmp, v, year, yearVal, _i, _len;
      max = {};
      for (year in al) {
        yearVal = al[year];
        for (_i = 0, _len = yearVal.length; _i < _len; _i++) {
          countryObj = yearVal[_i];
          if (max[countryObj.type] != null) {
            max[countryObj.type]++;
          } else {
            max[countryObj.type] = 1;
          }
        }
      }
      t = ((function() {
        var _results;
        _results = [];
        for (k in max) {
          v = max[k];
          _results.push({
            type: k,
            count: v
          });
        }
        return _results;
      })()).sort(function(a, b) {
        return b.count - a.count;
      });
      return ((function() {
        var _j, _len2, _results;
        _results = [];
        for (_j = 0, _len2 = t.length; _j < _len2; _j++) {
          tmp = t[_j];
          _results.push(tmp.type);
        }
        return _results;
      })()).slice(0, 40);
    }
  });
  yearAll = dvl.apply({
    args: [all, time],
    fn: function(a, t) {
      return a[t];
    }
  });
  kOrA = dvl.def("killed");
  allTimeData = dvl.apply({
    args: [all, kOrA],
    fn: function(a, v) {
      var countryObj, ret, rets, t, year, yearVal, _i, _j, _len, _len2;
      rets = [];
      for (year in a) {
        yearVal = a[year];
        for (_i = 0, _len = yearVal.length; _i < _len; _i++) {
          countryObj = yearVal[_i];
          rets.push(countryObj);
        }
      }
      t = {
        x: [],
        y: [],
        v: []
      };
      for (_j = 0, _len2 = rets.length; _j < _len2; _j++) {
        ret = rets[_j];
        t.x.push(ret.type);
        t.y.push(ret.country);
        t.v.push(ret[v]);
      }
      return t;
    }
  });
  clusX = dvl.apply({
    args: [allTimeData, maxDisasters],
    fn: function(ats, mds) {
      var c, cs, ret, _i, _len;
      cs = heatmap.clusterSort({
        xVals: ats.x,
        yVals: ats.y,
        valueVals: ats.v
      });
      ret = [];
      for (_i = 0, _len = cs.length; _i < _len; _i++) {
        c = cs[_i];
        if (__indexOf.call(mds, c) >= 0) {
          ret.push(c);
        }
      }
      return ret;
    }
  });
  clusY = dvl.apply({
    args: [allTimeData, maxCountries],
    fn: function(ats, mcs) {
      var c, cs, ret, _i, _len;
      cs = heatmap.clusterSort({
        xVals: ats.y,
        yVals: ats.x,
        valueVals: ats.v
      });
      ret = [];
      for (_i = 0, _len = cs.length; _i < _len; _i++) {
        c = cs[_i];
        if (__indexOf.call(mcs, c) >= 0) {
          ret.push(c);
        }
      }
      return ret;
    }
  });
  maxVals = dvl.apply({
    args: [all],
    fn: function(al) {
      var countryObj, max, year, yearVal, _i, _len;
      max = {
        killed: 0,
        affected: 0,
        cost: 0
      };
      for (year in al) {
        yearVal = al[year];
        for (_i = 0, _len = yearVal.length; _i < _len; _i++) {
          countryObj = yearVal[_i];
          if (countryObj.affected > max.affected) {
            max.affected = countryObj.affected;
          }
          if (countryObj.killed > max.killed) {
            max.killed = countryObj.killed;
          }
          if (countryObj.cost > max.cost) {
            max.cost = countryObj.cost;
          }
        }
      }
      return max;
    }
  });
  $(function() {
    var ht;
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
    ht = heatmap.def({
      graphSelector: '#canvas',
      buttonSelector: '#buttons',
      data: yearAll,
      params: dvl.def({
        x: "type",
        y: "country",
        value: "killed"
      }),
      showVals: ["killed", "affected", "cost"],
      metrics: [],
      verbose: true,
      maxVals: maxVals,
      maxCountries: maxCountries,
      maxDisasters: maxDisasters,
      clusterCountries: clusY,
      clusterDisasters: clusX
    });
    dvl.register({
      listen: [ht.val],
      change: [kOrA],
      fn: function() {
        var h;
        h = ht.val.get();
        if (!(h != null)) {
          return null;
        }
        if (kOrA.get() !== h) {
          return kOrA.set(h).notify();
        }
      }
    });
    $("button.killed").click(function() {
      return $(".credits a").css("color", "#4C1211");
    });
    $(".credits a").css("color", "#4C1211");
    $("button.affected").click(function() {
      return $(".credits a").css("color", "#243357");
    });
    return $("button.cost").click(function() {
      return $(".credits a").css("color", "#31A354");
    });
  });
}).call(this);
