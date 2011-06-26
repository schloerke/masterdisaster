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
      ecpm: {
        label: 'eCPM (% of top)',
        prefix: '$',
        postfix: '',
        numberFormater: function(d) {
          return d;
        },
        getScale: function(data) {
          var c, dataTmp, f, i, _ref;
          dataTmp = data['ecpm'].slice();
          for (i = _ref = dataTmp.length - 1; _ref <= 0 ? i <= 0 : i >= 0; _ref <= 0 ? i++ : i--) {
            if (!(dataTmp[i] > 0)) {
              dataTmp.splice(i, 1);
            }
          }
          f = function(d) {
            return d;
          };
          c = pv.Scale.quantile(dataTmp, f).range("#fff", "#4A85B5").quantiles(5);
          c.legendTicks = function() {
            var i, l, q, v, _ref2;
            l = [];
            q = c.quantiles();
            for (i = _ref2 = q.length - 2; _ref2 <= 0 ? i <= 0 : i >= 0; _ref2 <= 0 ? i++ : i--) {
              v = (q[i] + q[i + 1]) / 2;
              l.push({
                value: v,
                min: q[i],
                max: q[i + 1],
                text: "$" + (v.toFixed(2)) + " (" + ((5 - i) * 100 / 5) + "%)"
              });
            }
            return l;
          };
          c.between = false;
          return c;
        }
      },
      volume: {
        label: 'Volume',
        prefix: '',
        postfix: '',
        numberFormater: pv.identity,
        getScale: function(data) {
          var c, dataTmp, f, i, _ref;
          dataTmp = data['volume'].slice();
          for (i = _ref = dataTmp.length - 1; _ref <= 0 ? i <= 0 : i >= 0; _ref <= 0 ? i++ : i--) {
            if (!(dataTmp[i] > 0)) {
              dataTmp.splice(i, 1);
            }
          }
          f = function(d) {
            return d + 1;
          };
          c = pv.Scale.log(dataTmp, f).range("#fff", "#B54A85");
          c.legendTicks = function() {
            var do_action, l, maxImp;
            maxImp = pv.max(dataTmp, f);
            l = [];
            i = 1;
            do_action = function() {
              l.unshift({
                value: i,
                min: i,
                max: i,
                text: mmx.util.humanize_number(i)
              });
              return i *= 10;
            };
            do_action();
            while (i < maxImp) {
              do_action();
            }
            return l;
          };
          c.between = true;
          return c;
        }
      },
      revenue: {
        label: 'Revenue',
        prefix: '$',
        postfix: '',
        numberFormater: function(d) {
          return d.toFixed(3);
        },
        getScale: function(data) {
          var c, dataTmp, f, i, _ref;
          dataTmp = data['revenue'].slice();
          for (i = _ref = dataTmp.length - 1; _ref <= 0 ? i <= 0 : i >= 0; _ref <= 0 ? i++ : i--) {
            if (!(dataTmp[i] > 0)) {
              dataTmp.splice(i, 1);
            }
          }
          f = function(d) {
            if (d > 0) {
              return d;
            } else {
              return null;
            }
          };
          c = pv.Scale.quantile(dataTmp, f).range("#fff", "#854AB5").quantiles(5);
          c.legendTicks = function() {
            var i, l, q, v, _ref2;
            l = [];
            q = c.quantiles();
            for (i = _ref2 = q.length - 2; _ref2 <= 0 ? i <= 0 : i >= 0; _ref2 <= 0 ? i++ : i--) {
              v = (q[i] + q[i + 1]) / 2;
              l.push({
                value: v,
                min: q[i],
                max: q[i + 1],
                text: "$" + (v.toFixed(2)) + " (" + ((5 - i) * 100 / 5) + "%)"
              });
            }
            return l;
          };
          c.between = false;
          return c;
        }
      }
    },
    constructor_count: 0,
    def: function(_arg) {
      var buttonSelector, clusterX, clusterY, colorScale, controls, data, dataX, dataY, duration, getV, getX, getY, graphSelector, highlightValue, highlightX, highlightY, keys, labelText, legendTicks, margin, onclick, panel, params, scaledTicksX, scaledTicksY, showVals, size, sizeX, sizeY, sx, sy, updateColorScale, val, verbose, x, xTitle, y, yTitle;
      graphSelector = _arg.graphSelector, buttonSelector = _arg.buttonSelector, data = _arg.data, params = _arg.params, showVals = _arg.showVals, onclick = _arg.onclick, verbose = _arg.verbose;
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
        args: [params, data],
        fn: function(p, d) {
          if ((d[p.x] != null) && d[p.x].length && d[p.x][0]) {
            return p.x;
          } else {
            ;
          }
        }
      });
      y = dvl.apply({
        args: [params, data],
        fn: function(p, d) {
          if ((d[p.y] != null) && d[p.y].length && d[p.y][0]) {
            return p.y;
          } else {
            ;
          }
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
      duration = 300;
      colorScale = dvl.def(null, 'color_scale');
      labelText = dvl.def(null, 'label_text');
      legendTicks = dvl.def(null, 'legend_ticks');
      size = dvl.def({
        width: 900,
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
      dataX = dvl.apply({
        args: [data, getX, getY, getV, clusterX],
        fn: function(d, accX, accY, accV, cluster) {
          var mapped;
          if (cluster) {
            return mmx.heatmap.clusterSort({
              xVals: accX(d),
              yVals: accY(d),
              valueVals: accV(d)
            });
          } else {
            mapped = dvl.util.uniq(accX(d));
            mapped.sort();
            return mapped;
          }
        }
      });
      dataY = dvl.apply({
        args: [data, getX, getY, getV, clusterY],
        fn: function(d, accX, accY, accV, cluster) {
          var mapped;
          if (cluster) {
            return mmx.heatmap.clusterSort({
              xVals: accY(d),
              yVals: accX(d),
              valueVals: accV(d)
            });
          } else {
            mapped = dvl.util.uniq(accY(d));
            mapped.sort();
            return mapped;
          }
        }
      });
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
        var ds, m, mes, rawScale;
        mes = val.get();
        ds = data.get();
        if ((!(ds != null)) || (!(mes != null))) {
          return null;
        }
        m = mmx.heatmap.mesures[mes];
        if (!(m != null)) {
          throw "Measure: " + mes + " not defined. :-(";
        }
        rawScale = m.getScale(ds);
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
        listen: [data, val],
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
          data: dataX
        },
        rangeFrom: 0,
        rangeTo: panel.width,
        padding: 10
      });
      sy = dvl.scale.ordinal({
        name: "scale_y",
        domain: {
          data: dataY
        },
        rangeFrom: 0,
        rangeTo: panel.height,
        padding: 10
      });
      scaledTicksX = dvl.gen.fromArray(sx.ticks, null, sx.scale);
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
          angle: 45,
          color: dvl.gen.equal(sx.ticks, highlightX, "red", "black")
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
          color: dvl.gen.equal(sy.ticks, highlightY, "red", "black")
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
          var i, keyArr, xArr, yArr;
          xArr = x(ds);
          yArr = y(ds);
          i = 0;
          keyArr = [];
          while (i < xArr.length) {
            keyArr.push(xArr[i] + "_" + yArr[i]);
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
          centerX: dvl.gen.fromColumnData(data, getX, sx.scale),
          centerY: dvl.gen.fromColumnData(data, getY, sy.scale),
          width: sizeX,
          height: sizeY,
          fill: dvl.gen.fromColumnData(data, getV, colorScale)
        },
        on: {
          mousemove: function(i) {
            var d;
            d = data.get();
            highlightX.set(getX.get()(d)[i]);
            highlightY.set(getY.get()(d)[i]);
            highlightValue.set(getV.get()(d)[i]);
            dvl.notify(highlightX, highlightY, highlightValue);
            return null;
          },
          click: function(i) {
            var d, text, xVal, yVal;
            if ((onclick != null ? onclick.cell : void 0) != null) {
              d = data.get()[i];
              xVal = getX.get()(d);
              yVal = getY.get()(d);
              text = sx.ticks.gen()(i);
              onclick.cell({
                data: {
                  x: xVal,
                  y: yVal
                },
                dataItem: d,
                pos: i
              });
            }
            return null;
          }
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
          stroke: "#ccc"
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
        args: [x],
        fn: function(xVal) {
          switch (xVal) {
            case "affected":
              return "Affected";
            case "killed":
              return "Killed";
            default:
              return "you suck";
          }
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
          color: "black"
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
          color: "black"
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
        dataX: dataX,
        dataY: dataY,
        xTitle: xTitle,
        yTitle: yTitle,
        identifier: "heatmap_" + (mmx.heatmap.constructor_count++)
      };
    }
  };
}).call(this);
