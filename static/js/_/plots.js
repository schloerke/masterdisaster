(function() {
  var instrument_graph;
  instrument_graph = function(_arg) {
    var barWidth, data, duration, getX, getYs, humanize, main_number, margin, panel, rawPadding, scaledTicksX, scaledTicksY, selector, size, sx, sy, type, what, whats, yDomains, _i, _j, _k, _l, _len, _len2, _len3, _len4, _results;
    data = _arg.data, selector = _arg.selector, type = _arg.type, whats = _arg.whats, humanize = _arg.humanize, rawPadding = _arg.rawPadding, duration = _arg.duration;
    if (!(data != null)) {
      throw "data must be included in a instrument_graph";
    }
    if (!(selector != null)) {
      throw "selector must be included in a instrument_graph";
    }
    if (!(type != null)) {
      throw "type must be included in a instrument_graph";
    }
    if (!(whats != null)) {
      throw "whats must be included in a instrument_graph";
    }
    if (!(rawPadding != null)) {
      throw "rawPadding must be included in a instrument_graph";
    }
    if (!(duration != null)) {
      throw "duration must be included in a instrument_graph";
    }
    humanize || (humanize = true);
    whats = dvl.typeOf(whats) !== "array" ? [whats] : whats;
    getX = dvl.acc('timestamp');
    getYs = {};
    for (_i = 0, _len = whats.length; _i < _len; _i++) {
      what = whats[_i];
      getYs[what] = dvl.acc(what);
    }
    size = dvl.def({
      width: 600,
      height: 300
    }, size);
    margin = dvl.def({
      top: 30,
      bottom: 70,
      left: 70,
      right: 30
    }, "margin");
    dvl.resizer(size, null, {
      selector: selector,
      minWidth: 350,
      maxHeight: 300,
      minHeight: 300
    });
    panel = dvl.svg.canvas({
      selector: selector,
      size: size,
      margin: margin
    });
    sx = dvl.scale.linear({
      name: "scale_x",
      domain: {
        data: data,
        acc: getX,
        sorted: true
      },
      rangeFrom: 0,
      rangeTo: panel.width,
      padding: rawPadding
    });
    yDomains = (function() {
      var _j, _len2, _results;
      _results = [];
      for (_j = 0, _len2 = whats.length; _j < _len2; _j++) {
        what = whats[_j];
        _results.push({
          data: data,
          acc: getYs[what]
        });
      }
      return _results;
    })();
    sy = dvl.scale.linear({
      name: "scale_y",
      domain: yDomains,
      rangeFrom: 0,
      rangeTo: panel.height,
      padding: rawPadding,
      scaleMax: 1.1,
      anchor: true
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
        bottom: scaledTicksY,
        left1: 0,
        right2: 0
      }
    });
    dvl.svg.lines({
      panel: panel,
      duration: duration,
      classStr: 'axis',
      props: {
        bottom: rawPadding,
        left1: 0,
        right2: 0
      }
    });
    dvl.svg.labels({
      panel: panel,
      duration: duration,
      props: {
        key: sx.ticks,
        left: scaledTicksX,
        bottom: -3,
        text: dvl.gen.fromArray(sx.ticks, null, sx.format),
        baseline: "top",
        align: "middle"
      }
    });
    dvl.svg.labels({
      panel: panel,
      duration: duration,
      props: {
        key: sy.ticks,
        left: -3,
        bottom: scaledTicksY,
        text: dvl.gen.fromArray(sy.ticks, null, sy.format),
        align: "end",
        baseline: "middle"
      }
    });
    if (type === 'line') {
      for (_j = 0, _len2 = whats.length; _j < _len2; _j++) {
        what = whats[_j];
        dvl.svg.line({
          panel: panel,
          duration: duration,
          classStr: what,
          props: {
            key: dvl.gen.fromArray(data, getX),
            left: dvl.gen.fromArray(data, getX, sx.scale),
            bottom: dvl.gen.fromArray(data, getYs[what], sy.scale)
          }
        });
      }
    } else if (type === 'bar') {
      barWidth = dvl.apply({
        invalid: 10,
        args: [panel.width, data],
        fn: function(w, d) {
          if (d.length) {
            return w / d.length * 0.7;
          } else {
            return 10;
          }
        }
      });
      for (_k = 0, _len3 = whats.length; _k < _len3; _k++) {
        what = whats[_k];
        dvl.svg.bars({
          panel: panel,
          duration: duration,
          classStr: what,
          props: {
            key: dvl.gen.fromArray(data, getX),
            centerX: dvl.gen.fromArray(data, getX, sx.scale),
            width: barWidth,
            bottom: rawPadding + 1,
            height: dvl.gen.fromArray(data, getYs[what], sy.scale)
          }
        });
      }
    }
    main_number = function(w) {
      return dvl.html.out({
        selector: "#" + w + "_main_number",
        data: data,
        format: function(d) {
          var avg, item, _l, _len4;
          if (d && d.length > 0) {
            avg = 0;
            for (_l = 0, _len4 = d.length; _l < _len4; _l++) {
              item = d[_l];
              avg += item[w];
            }
            avg = avg / d.length;
            if (humanize) {
              return humanize_number(avg);
            } else {
              return avg.toFixed(0);
            }
          } else {
            return '';
          }
        }
      });
    };
    _results = [];
    for (_l = 0, _len4 = whats.length; _l < _len4; _l++) {
      what = whats[_l];
      _results.push(main_number(what));
    }
    return _results;
  };
}).call(this);
