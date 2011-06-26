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
      killed: {
        label: 'Killed',
        prefix: '',
        postfix: '',
        numberFormater: pv.identity,
        getScale: function(data, maxVal) {
          var c, d;
          c = pv.Scale.log(1, maxVal).range("#fff", "#BC0F00");
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
      var buttonSelector, clusterX, clusterY, colorScale, controls, data, duration, getV, getX, getY, graphSelector, highlightValue, highlightX, highlightY, keys, labelText, legendTicks, margin, maxCountries, maxDisasters, maxVals, onclick, panel, params, scaledTicksY, showVals, size, sizeX, sizeY, sx, sy, updateColorScale, val, verbose, x, xTitle, y, yTitle;
      graphSelector = _arg.graphSelector, buttonSelector = _arg.buttonSelector, data = _arg.data, params = _arg.params, showVals = _arg.showVals, onclick = _arg.onclick, maxVals = _arg.maxVals, maxDisasters = _arg.maxDisasters, maxCountries = _arg.maxCountries, verbose = _arg.verbose;
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
        }).on('click', function(d) {
          return val.set(d).notify();
        });
        controls.append("span").text(" | ");
        controls.append("button").attr("class", "heatmap_button").text("Toggle clustering").on("click", function() {
          var c;
          c = !clusterX.get();
          clusterX.set(c);
          clusterY.set(c);
          dvl.notify(clusterX, clusterY);
          return null;
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
          data: maxDisasters,
          uniq: true
        },
        rangeFrom: 0,
        rangeTo: panel.width,
        padding: 10
      });
      sy = dvl.scale.ordinal({
        name: "scale_y",
        domain: {
          data: maxCountries,
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
          angle: 55,
          color: dvl.gen.equal(sx.ticks, highlightX, "#333", "#666")
        },
        on: {
          click: function(i) {
            var text;
            if ((onclick != null ? onclick.xLabel : void 0) != null) {
              text = sx.ticks.gen()(i);
              onclick.xLabel({
                label: text,
                pos: i
              });
            }
            return null;
          }
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
          color: dvl.gen.equal(sy.ticks, highlightY, "#333", "#666")
        },
        on: {
          click: function(i) {
            var text;
            if ((onclick != null ? onclick.yLabel : void 0) != null) {
              text = sy.ticks.gen()(i);
              onclick.yLabel({
                label: text,
                pos: i
              });
            }
            return null;
          }
        }
      });
      sizeX = dvl.apply({
        args: sx.band,
        fn: function(b) {
          return 0.9 * b;
        }
      });
      sizeY = dvl.apply({
        args: sy.band,
        fn: function(b) {
          return 0.9 * b;
        }
      });
      keys = dvl.apply({
        args: [data, getX, getY],
        fn: function(ds, x, y) {
          var i, k, keyArr;
          i = 0;
          keyArr = [];
          while (i < ds.length) {
            k = x(ds[i]) + "_" + y(ds[i]);
            keyArr.push(k.replace(/[^a-zA-Z]/g, ''));
            i++;
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
          width: 20,
          height: 20,
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
          width: 20,
          height: 20,
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
          color: "#666"
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
          color: "#666"
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
