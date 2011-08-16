(function() {
  window.mmx = {};
  mmx.check = {};
  mmx.check.no_def = function(value, title, classStr) {
    if (!(value != null)) {
      throw new Error("Please include '" + title + "' when making a " + classStr);
    }
    return mmx.check;
  };
  window.heatmap = {
    clusterSort: function(_arg) {
      var explore, i, labels, ni, order, root, s, valueVals, values, vectors, xMap, xVals, xs, yMap, yVals, ys;
      xVals = _arg.xVals, yVals = _arg.yVals, valueVals = _arg.valueVals;
      xs = dvl.util.uniq(xVals);
      ys = dvl.util.uniq(yVals);
      yMap = dvl.util.flip(ys);
      xMap = {};
      s = pv.Scale.quantile(valueVals).range(1, 5).quantiles(5);
      values = ys.map(function() {
        return 0;
      });
      labels = xs;
      vectors = [];
      i = 0;
      while (i < xs.length) {
        ni = values.slice();
        vectors.push(ni);
        xMap[xs[i]] = ni;
        i++;
      }
      i = 0;
      while (i < xVals.length) {
        xMap[xVals[i]][yMap[yVals[i]]] = s(valueVals[i]);
        i++;
      }
      root = figue.agglomerate(labels, vectors, figue.EUCLIDIAN_DISTANCE, figue.SINGLE_LINKAGE);
      order = [];
      explore = function(n) {
        if (n.label !== -1) {
          return order.push(n.label);
        } else {
          explore(n.right);
          return explore(n.left);
        }
      };
      explore(root);
      return order;
    },
    mesures: {
      cost: {
        label: 'Cost',
        prefix: '',
        postfix: '',
        numberFormater: pv.identity,
        getScale: function(data, maxVal) {
          var c, d;
          c = pv.Scale.log(1, maxVal).range("white", "#31A354");
          d = [300000000, 150000000, 75000000, 10000000, 2500000, 50000, 5000, 1000];
          c.legendTicks = function() {
            var ret, t, _i, _len;
            ret = [];
            for (_i = 0, _len = d.length; _i < _len; _i++) {
              t = d[_i];
              ret.push({
                value: t,
                text: t
              });
            }
            return ret;
          };
          c.between = false;
          return c;
        }
      },
      killed: {
        label: 'Killed',
        prefix: '',
        postfix: '',
        numberFormater: pv.identity,
        getScale: function(data, maxVal) {
          var c, d;
          c = pv.Scale.log(1, maxVal).range("#FC625D", "#2D0404");
          d = [5000000, 1000000, 500000, 100000, 50000, 10000, 5000, 1000];
          c.legendTicks = function() {
            var ret, t, _i, _len;
            ret = [];
            for (_i = 0, _len = d.length; _i < _len; _i++) {
              t = d[_i];
              ret.push({
                value: t,
                text: t
              });
            }
            return ret;
          };
          c.between = false;
          return c;
        }
      },
      affected: {
        label: 'Affected',
        prefix: '',
        postfix: '',
        numberFormater: pv.identity,
        getScale: function(data, maxVal) {
          var c, d;
          c = pv.Scale.log(1, maxVal).range("#fff", "#3f4c6b");
          d = [125000, 75000, 25000, 12500, 7500, 2500, 1250, 750];
          c.legendTicks = function() {
            var ret, t, _i, _len;
            ret = [];
            for (_i = 0, _len = d.length; _i < _len; _i++) {
              t = d[_i];
              ret.push({
                value: t,
                text: t
              });
            }
            return ret;
          };
          c.between = false;
          return c;
        }
      }
    },
    constructor_count: 0,
    def: function(_arg) {
      var buttonSelector, clusterCountries, clusterDisasters, clusterX, clusterY, colorScale, controls, countryValues, data, disasterValues, duration, getV, getX, getY, graphSelector, highlightValue, highlightX, highlightY, keys, labelText, legendTicks, margin, maxCountries, maxDisasters, maxVals, onclick, panel, params, scaledTicksY, showVals, size, sizeX, sizeY, sx, sy, updateColorScale, val, verbose, x, xTitle, y, yTitle;
      graphSelector = _arg.graphSelector, buttonSelector = _arg.buttonSelector, data = _arg.data, params = _arg.params, showVals = _arg.showVals, onclick = _arg.onclick, maxVals = _arg.maxVals, maxDisasters = _arg.maxDisasters, maxCountries = _arg.maxCountries, clusterDisasters = _arg.clusterDisasters, clusterCountries = _arg.clusterCountries, verbose = _arg.verbose;
      verbose || (verbose = false);
      if (!(buttonSelector != null)) {
        if (verbose) {
          o.log("buttonSelector is not defined... not placing buttons");
        }
      } else {
        buttonSelector = dvl.wrapConstIfNeeded(buttonSelector);
      }
      mmx.check.no_def(data, "data", "Heatmap");
      mmx.check.no_def(showVals, "showVals", "Heatmap");
      mmx.check.no_def(params, "params", "Heatmap");
      graphSelector = dvl.wrapConstIfNeeded(graphSelector);
      showVals = dvl.wrapConstIfNeeded(showVals);
      x = dvl.apply({
        args: [params],
        fn: function(p) {
          return p.x;
        }
      });
      y = dvl.apply({
        args: [params],
        fn: function(p) {
          return p.y;
        }
      });
      val = dvl.apply({
        args: [params],
        fn: function(p) {
          return p.value;
        }
      });
      clusterX = dvl.def(false, 'clusterX');
      clusterY = dvl.def(false, 'clusterY');
      disasterValues = dvl.apply({
        args: [clusterX, maxDisasters, clusterDisasters],
        fn: function(cx, md, cd) {
          if (cx === true) {
            return cd;
          } else {
            return md;
          }
        }
      });
      countryValues = dvl.apply({
        args: [clusterY, maxCountries, clusterCountries],
        fn: function(cy, mc, cc) {
          if (cy === true) {
            return cc;
          } else {
            return mc;
          }
        }
      });
      getX = dvl.acc(x);
      getY = dvl.acc(y);
      getV = dvl.acc(val);
      duration = 700;
      colorScale = dvl.def(null, 'color_scale');
      labelText = dvl.def(null, 'label_text');
      legendTicks = dvl.def(null, 'legend_ticks');
      size = dvl.def({
        width: 1080,
        height: 800
      }, "size");
      margin = dvl.def({
        top: 30,
        bottom: 170,
        left: 170,
        right: 150
      }, "margin");
      highlightX = dvl.def(null, 'hightlightX');
      highlightY = dvl.def(null, 'hightlightY');
      highlightValue = dvl.def(null, 'highlightValue');
      if (buttonSelector != null) {
        controls = d3.select(buttonSelector.get());
        controls.selectAll("button").data(showVals.get()).enter("button").text(function(d) {
          return d;
        }).attr("class", function(d) {
          return d;
        }).on('click', function(d) {
          return val.set(d).notify();
        });
        $("button.killed").attr("title", "Number of Deaths");
        $("button.affected").attr("title", "Number of Property or Physical Loss");
        $("button.cost").attr("title", "Estimated Cost of Event ");
        $("#buttons").find("button").click(function() {
          $(".selected").removeClass("selected");
          return $(this).addClass("selected");
        });
        $("button.killed").addClass("selected");
        controls.append("span").text(" | ");
        controls.append("button").attr("class", "heatmap_button").attr("title", "Group points according to each country's disasters over the whole time range.").text("cluster").on("click", function() {
          var c;
          c = !clusterX.get();
          clusterX.set(c);
          clusterY.set(c);
          dvl.notify(clusterX, clusterY);
          return null;
        });
        dvl.html.out({
          selector: "button.heatmap_button",
          data: clusterX,
          format: function(cx) {
            if (cx) {
              return "cluster on";
            } else {
              return "cluster off";
            }
          }
        });
      }
      updateColorScale = function() {
        var ds, m, mes, mxVal, rawScale;
        mes = val.get();
        ds = data.get();
        mxVal = maxVals.get();
        if ((!(ds != null)) || (!(mes != null))) {
          return null;
        }
        m = heatmap.mesures[mes];
        if (!(m != null)) {
          throw "Measure: " + mes + " not defined. :-(";
        }
        rawScale = m.getScale(ds, mxVal[mes]);
        colorScale.set(function(d) {
          if (d > 0) {
            return rawScale(d).color;
          } else {
            return 'none';
          }
        });
        legendTicks.set(rawScale.legendTicks());
        return dvl.notify(colorScale, legendTicks);
      };
      dvl.register({
        fn: updateColorScale,
        listen: [data, val, maxVals],
        change: [colorScale, labelText, legendTicks],
        name: 'color_updater'
      });
      panel = dvl.svg.canvas({
        selector: graphSelector.get(),
        size: size,
        margin: margin,
        classStr: 'heatmap',
        on: {
          mouseout: function() {
            highlightX.set(null);
            highlightY.set(null);
            highlightValue.set(null);
            return dvl.notify(highlightX, highlightY, highlightValue);
          }
        }
      });
      sx = dvl.scale.ordinal({
        name: "scale_x",
        domain: {
          data: disasterValues,
          uniq: true
        },
        rangeFrom: 0,
        rangeTo: panel.width,
        padding: 10
      });
      sy = dvl.scale.ordinal({
        name: "scale_y",
        domain: {
          data: countryValues,
          uniq: true
        },
        rangeFrom: 0,
        rangeTo: panel.height,
        padding: 10
      });
      window.scaledTicksX = dvl.gen.fromArray(sx.ticks, null, sx.scale);
      scaledTicksY = dvl.gen.fromArray(sy.ticks, null, sy.scale);
      dvl.svg.lines({
        panel: panel,
        duration: duration,
        props: {
          key: sx.ticks,
          left: scaledTicksX,
          top1: 0,
          bottom2: 0
        }
      });
      dvl.svg.lines({
        panel: panel,
        duration: duration,
        props: {
          key: sy.ticks,
          top: scaledTicksY,
          left1: 0,
          right2: 0
        }
      });
      dvl.html.out({
        selector: '#hx',
        data: highlightX,
        text: true
      });
      dvl.html.out({
        selector: '#hy',
        data: highlightY,
        text: true
      });
      dvl.html.out({
        selector: '#v',
        data: highlightValue,
        text: true
      });
      dvl.svg.labels({
        panel: panel,
        duration: 0,
        props: {
          key: sx.ticks,
          left: scaledTicksX,
          bottom: -3,
          text: sx.ticks,
          baseline: "top",
          align: "start",
          angle: 90,
          color: dvl.gen.equal(sx.ticks, highlightX, "#333", "#888")
        }
      });
      dvl.svg.labels({
        panel: panel,
        duration: 0,
        props: {
          key: sy.ticks,
          left: -3,
          top: scaledTicksY,
          text: sy.ticks,
          align: "end",
          baseline: "middle",
          color: dvl.gen.equal(sy.ticks, highlightY, "#333", "#888")
        }
      });
      sizeX = dvl.apply({
        args: [data, val],
        fn: function(bs, v) {
          var b, k, _i, _len;
          k = [];
          for (_i = 0, _len = bs.length; _i < _len; _i++) {
            b = bs[_i];
            if (b[v] < 1) {
              b[v] = 1;
            }
            k.push(Math.log(b[v]) * 3.5);
          }
          return k;
        }
      });
      sizeY = dvl.apply({
        args: [data, val],
        fn: function(bs, v) {
          var b, k, _i, _len;
          k = [];
          for (_i = 0, _len = bs.length; _i < _len; _i++) {
            b = bs[_i];
            if (b[v] < 1) {
              b[v] = 1;
            }
            k.push(Math.log(b[v]) * 3.5);
          }
          return k;
        }
      });
      keys = dvl.apply({
        args: [data, getX, getY],
        fn: function(ds, x, y) {
          var i, item, k, keyArr, pos, _len;
          i = 0;
          keyArr = [];
          while (i < ds.length) {
            k = x(ds[i]) + "_" + y(ds[i]);
            keyArr.push(k.replace(/[^a-zA-Z]/g, ''));
            i++;
          }
          for (pos = 0, _len = keyArr.length; pos < _len; pos++) {
            item = keyArr[pos];
            if (keyArr.indexOf(item) !== pos) {
              o.ut(true, "item: ", item);
              throw ":- (";
            }
          }
          return keyArr;
        }
      });
      dvl.svg.bars({
        panel: panel,
        duration: duration,
        props: {
          key: keys,
          centerX: dvl.gen.fromArray(data, getX, sx.scale),
          centerY: dvl.gen.fromArray(data, getY, sy.scale),
          width: sizeX,
          height: sizeY,
          fill: dvl.gen.fromArray(data, getV, colorScale)
        }
      });
      dvl.svg.bars({
        panel: panel,
        duration: 0,
        clip: false,
        props: {
          right: -40,
          top: dvl.gen.fromFn(function(i) {
            return 200 + i * 24;
          }),
          width: 15,
          height: 15,
          fill: dvl.gen.fromArray(legendTicks, dvl.acc('value'), colorScale),
          stroke: "none"
        }
      });
      dvl.svg.labels({
        panel: panel,
        duration: 0,
        clip: false,
        props: {
          right: -50,
          top: dvl.gen.fromFn(function(i) {
            return 200 + 12 + i * 24;
          }),
          width: 10,
          height: 15,
          text: dvl.gen.fromArray(legendTicks, dvl.acc('text'))
        }
      });
      xTitle = dvl.apply({
        args: [val],
        fn: function(xVal) {
          return "Disaster";
        }
      });
      dvl.svg.labels({
        panel: panel,
        classStr: "heatmap_x_title",
        props: {
          left: dvl.apply({
            args: panel.width,
            fn: function(pw) {
              return (pw - 0) / 2;
            }
          }),
          bottom: -130,
          text: xTitle,
          baseline: "top",
          align: "middle",
          color: "#ccc"
        }
      });
      yTitle = dvl.def("Country");
      dvl.svg.labels({
        panel: panel,
        classStr: "heatmap_y_title",
        props: {
          top: dvl.apply({
            args: panel.height,
            fn: function(ph) {
              return (ph - 0) / 2;
            }
          }),
          left: -150,
          text: yTitle,
          baseline: "middle",
          align: "right",
          angle: -90,
          color: "#ccc"
        }
      });
      return {
        graphSelector: graphSelector,
        buttonSelector: buttonSelector,
        data: data,
        params: params,
        showVals: showVals,
        verbose: verbose,
        clusterX: clusterX,
        clusterY: clusterY,
        x: x,
        getX: getX,
        y: y,
        getY: getY,
        val: val,
        getV: getV,
        xTitle: xTitle,
        yTitle: yTitle,
        identifier: "heatmap_" + (heatmap.constructor_count++)
      };
    }
  };
}).call(this);
