window.mmx = {}

mmx.check = {}
mmx.check.no_def = (value, title, classStr) ->
  if not value?
    throw new Error("Please include '#{ title }' when making a #{ classStr }")
  return mmx.check



window.heatmap = {
  
  clusterSort: ({xVals, yVals, valueVals}) ->
    xs = dvl.util.uniq(xVals)
    ys = dvl.util.uniq(yVals)
    yMap = dvl.util.flip(ys)
    xMap = {}
    
    s = pv.Scale.quantile(valueVals).range(1, 5).quantiles(5)
    
    values = ys.map(-> 0)
    
    labels = xs
    vectors = []
    i=0
    while i < xs.length
      ni = values.slice()
      vectors.push(ni)
      xMap[xs[i]] = ni
      i++
      
    i = 0
    while i < xVals.length
      xMap[xVals[i]][yMap[yVals[i]]] = s(valueVals[i])
      i++
      
    root = figue.agglomerate(labels, vectors, figue.EUCLIDIAN_DISTANCE, figue.SINGLE_LINKAGE)
    
    order = []
    explore = (n) ->
      if n.label != -1
        order.push(n.label)
      else
        explore(n.right)
        explore(n.left)
      
    explore(root)
    
    return order
  
  # This essentialy configured the mmx.heatmap
  mesures: {
    killed: 
      label: 'Killed'
      prefix: ''
      postfix: ''
      numberFormater: pv.identity
      getScale: (data) ->
        
        # TODO... didn't know how to subset in pv
        dataTmp = data.map((d) -> return d.killed)
        f = (d) -> return d
              
        c = pv.Scale.quantile(dataTmp, f).range("#fff", "#4A85B5").quantiles(5)
        c.legendTicks = ->
          l = []
          q = c.quantiles()
          
          for i in [(q.length-2)..0]
            v = (q[i] + q[i+1]) / 2
            l.push {
              value: v
              min: q[i]
              max: q[i+1]
              text: v #"$#{ v.toFixed(2) } (#{ (5-i) * 100 / 5 }%)"
            }
          return l
        c.between = false
        return c
        
    affected: 
      label: 'Affected'
      prefix: ''
      postfix: ''
      numberFormater: pv.identity
      getScale: (data) ->
        
        # TODO... didn't know how to subset in pv
        dataTmp = data.map((d) -> return d.killed)
        f = (d) -> return d
        
        c = pv.Scale.quantile(dataTmp, f).range("#fff", "#4A85B5").quantiles(5)
        c.legendTicks = ->
          l = []
          q = c.quantiles()
          
          for i in [(q.length-2)..0]
            v = (q[i] + q[i+1]) / 2
            l.push {
              value: v
              min: q[i]
              max: q[i+1]
              text: v #"$#{ v.toFixed(2) } (#{ (5-i) * 100 / 5 }%)"
            }
          return l
        c.between = false
        return c
  }
  
  
  
  constructor_count: 0
  
  def: ({graphSelector, buttonSelector, data, params, showVals, onclick, verbose}) ->  
    verbose or= false
    
    dvl.debug "data: ", data
    
    # mmx.check.no_def(graphSelector, "graphSelector", "Heatmap")
    if not buttonSelector?
      o.log("buttonSelector is not defined... not placing buttons") if verbose
    else
      buttonSelector  = dvl.wrapConstIfNeeded(buttonSelector)
      
      
    mmx.check.no_def(data,      "data",       "Heatmap")
    mmx.check.no_def(showVals,  "showVals",   "Heatmap")
    mmx.check.no_def(params,    "params",     "Heatmap")
    
    
    # what is being displayed and what options does it have
    graphSelector   = dvl.wrapConstIfNeeded(graphSelector)
    showVals        = dvl.wrapConstIfNeeded(showVals)
    
    
    x = dvl.apply {
      args: [params]
      fn: (p) ->
        return p.x
    }
    
    y = dvl.apply {
      args: [params]
      fn: (p) ->
        return p.y
    }
    
    val = dvl.apply {
      args: [params]
      fn: (p) -> return p.value
    }
    
    clusterX = dvl.def(false, 'clusterX')
    clusterY = dvl.def(false, 'clusterY')
    getX = dvl.acc(x)
    getY = dvl.acc(y)
    getV = dvl.acc(val)
    duration = 0 #100
    
    colorScale  = dvl.def(null, 'color_scale')
    labelText   = dvl.def(null, 'label_text')
    legendTicks = dvl.def(null, 'legend_ticks')
    
    size    = dvl.def({ width: 900, height: 800 }, "size")
    margin  = dvl.def({ top: 30, bottom: 170, left: 170, right: 150 }, "margin")
    
    highlightX      = dvl.def(null, 'hightlightX')
    highlightY      = dvl.def(null, 'hightlightY')
    highlightValue  = dvl.def(null, 'highlightValue')
    
    # setup buttons
    if buttonSelector?
      controls = d3.select(buttonSelector.get())
      controls
        .selectAll("button")
        .data(showVals.get())
        .enter("button")
          .text((d) -> d)
          .on('click', (d) -> val.set(d).notify())
        
      controls.append("span").text(" | ");
    
      controls.append("button")
        .attr("class", "heatmap_button")
        .text("Toggle clustering")
        .on("click", () ->
          c = not clusterX.get()
          # c is T/F
          clusterX.set(c)
          clusterY.set(c)
          
          dvl.notify(clusterX, clusterY)
          null
        )
    
    # Legend
    updateColorScale = () ->
      mes = val.get()
      ds = data.get()
      
      o.ut(true, "mes: ", mes)
      o.ut(true, "ds: ", ds)
      
      
      return null if (not ds?) or (not mes?)
      m = heatmap.mesures[mes]
      if not m?
        throw "Measure: #{mes} not defined. :-("
      rawScale = m.getScale(ds)
      colorScale.set((d) -> if d > 0 then rawScale(d).color else 'none')
      legendTicks.set(rawScale.legendTicks())
    
      dvl.notify(colorScale, legendTicks)
    
    dvl.register {
      fn: updateColorScale,
      listen: [data, val],
      change: [colorScale, labelText, legendTicks],
      name: 'color_updater'
    }
    
    
    # draw pretty pictures!
    panel = dvl.svg.canvas {
      selector: graphSelector.get()
      size:     size
      margin:   margin
      classStr: 'heatmap'
      on:
        mouseout: ->
          highlightX.set(null)
          highlightY.set(null)
          highlightValue.set(null)
          dvl.notify(highlightX, highlightY, highlightValue)
    }
    
    sx = dvl.scale.ordinal {
      name: "scale_x"
      domain: { data: data, acc: getX, uniq: true }
      rangeFrom: 0
      rangeTo: panel.width
      padding: 10
    }
    
    sy = dvl.scale.ordinal {
      name: "scale_y"
      domain: { data: data, acc: getY, uniq: true }
      rangeFrom: 0
      rangeTo: panel.height
      padding: 10
    }
    
    window.scaledTicksX = dvl.gen.fromArray(sx.ticks, null, sx.scale)
    scaledTicksY = dvl.gen.fromArray(sy.ticks, null, sy.scale)
    
    dvl.debug "sx.ticks", sx.ticks
    dvl.debug "sx.scale", sx.scale
    dvl.debug "scaledTicksX", scaledTicksX
    
    dvl.svg.lines {
      panel:    panel
      duration: duration
      props:
        key:      sx.ticks
        left:     scaledTicksX
        top1:     0
        bottom2:  0
    }
    
    dvl.svg.lines {
      panel: panel
      duration: duration
      props:
        key: sy.ticks
        top: scaledTicksY
        left1: 0
        right2: 0
    }
    
    dvl.html.out {
      selector: '#hx'
      data: highlightX
      text: true
    }
    
    dvl.html.out {
      selector: '#hy'
      data: highlightY
      text: true
    }

    dvl.html.out {
      selector: '#v'
      data: highlightValue
      text: true
    }


    # X Label
    dvl.svg.labels {
      panel: panel
      duration: 0
      props:
        key: sx.ticks
        left: scaledTicksX
        bottom: -3
        text: sx.ticks
        baseline: "top"
        align: "start"
        angle: 45
        color: dvl.gen.equal(sx.ticks, highlightX, "red", "black")
      on:
        click: (i) ->
          if onclick?.xLabel?
            text = sx.ticks.gen()(i)
            onclick.xLabel {
              label: text
              pos: i
            }
          null
    }
    
    # Y Label
    dvl.svg.labels {
      panel: panel
      duration: 0
      props:
        key: sy.ticks
        left: -3
        top:  scaledTicksY
        text: sy.ticks
        align: "end"
        baseline: "middle"
        color: dvl.gen.equal(sy.ticks, highlightY, "red", "black")
      on:
        click: (i) ->
          if onclick?.yLabel?
            text = sy.ticks.gen()(i)
            onclick.yLabel {
              label: text
              pos: i
            }
          null
    }

    sizeX = dvl.apply {
      args: sx.band
      fn: (b) -> return 0.9 * b
    }
    sizeY = dvl.apply {
      args: sy.band
      fn: (b) -> return 0.9 * b
    }
    keys = dvl.apply {
      args: [data, getX, getY]
      fn: (ds, x, y) ->    
        i = 0
        keyArr = []
        while i < ds.length
          k = x(ds[i]) + "_" + y(ds[i])
          keyArr.push(k.replace(/[^a-zA-Z]/g, ''))
          i++
          
        return keyArr
    }
    dvl.debug 'keys', keys
    
    dvl.debug "colorScale: ", colorScale
    dvl.svg.bars {
      panel: panel
      duration: duration
      props:
        # key:      keys
        centerX:  dvl.gen.fromArray(data, getX, sx.scale)
        centerY:  dvl.gen.fromArray(data, getY, sy.scale)
        width:    sizeX
        height:   sizeY
        fill:     dvl.gen.fromArray(data, getV, colorScale)
      # on:
      #   mousemove: (i) ->
      #     d = data.get()
      #     x = getX.get()
      #     y = getY.get()
      #     v = getV.get()
      #     
      #     highlightX.set(x(d[i]))
      #     highlightY.set(y(d[i]))
      #     highlightValue.set(v(d[i]))
      #     dvl.notify(highlightX, highlightY, highlightValue)
      #     null
      #     
      #   click: (i) ->
      #     if onclick?.cell?
      #       d = data.get()[i]
      #       xVal = getX.get()(d)
      #       yVal = getY.get()(d)
      #       
      #       text = sx.ticks.gen()(i)
      #       onclick.cell {
      #         data:
      #           x: xVal
      #           y: yVal
      #         dataItem: d
      #         pos: i
      #       }
      #     null
      
    }
    
    dvl.svg.bars {
      panel: panel
      duration: 0
      clip: false
      props:
        right: -40
        top: dvl.gen.fromFn((i) -> 200+i*24 )
        width: 20
        height: 20
        fill: dvl.gen.fromArray(legendTicks, dvl.acc('value'), colorScale)
        stroke: "#ccc"
    }
    
    dvl.svg.labels {
      panel: panel
      duration: 0
      clip: false
      props: 
        right: -50
        top: dvl.gen.fromFn((i) -> 200+12+i*24 )
        width: 20
        height: 20
        text: dvl.gen.fromArray(legendTicks, dvl.acc('text'))
    }
    
    
    
    # X Title
    xTitle = dvl.apply {
      args: [val]
      fn: (xVal) ->
        return "Disaster"
    }
    dvl.svg.labels {
      panel: panel
      classStr: "heatmap_x_title"
      props:
        left: dvl.apply {
          args: panel.width
          fn: (pw) ->
            return (pw - 0) / 2
        }
        bottom: -130
        text: xTitle
        baseline: "top"
        align: "middle"
        # angle: 45
        color: "black" # dvl.gen.equal(sx.ticks, highlightX, "red", "black")
    }

    # Y Title
    yTitle = dvl.def("Country")
    
    dvl.svg.labels {
      panel: panel
      classStr: "heatmap_y_title"
      props:
        top: dvl.apply {
          args: panel.height
          fn: (ph) ->
            return (ph - 0) / 2
        }
        left: -150
        text: yTitle
        baseline: "middle"
        align: "right"
        angle: -90
        color: "black" # dvl.gen.equal(sx.ticks, highlightX, "red", "black")
    }
    
    
    
    # mmx.heatmap new return
    return {
      graphSelector
      buttonSelector
      data
      params
      showVals
      verbose
      clusterX
      clusterY
      x
      getX
      y
      getY
      val
      getV
      xTitle
      yTitle
      identifier: "heatmap_#{heatmap.constructor_count++}"
    }

}


  
  
  
