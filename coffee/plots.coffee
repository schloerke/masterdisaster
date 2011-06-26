window.instrument_graph = ({data, selector, type, whats, humanize, rawPadding, duration}) ->
  if not data?        then throw "data must be included in a instrument_graph"
  if not selector?    then throw "selector must be included in a instrument_graph"
  if not type?        then throw "type must be included in a instrument_graph"
  if not whats?       then throw "whats must be included in a instrument_graph"
  if not rawPadding?  then throw "rawPadding must be included in a instrument_graph"
  if not duration?    then throw "duration must be included in a instrument_graph"
  
  humanize or= true
  whats = if dvl.typeOf(whats) isnt "array" then [whats] else whats
  
  getX = dvl.acc('timestamp')  
  
  getYs = {}
  getYs[what] = dvl.acc(what) for what in whats
  
  size = dvl.def({ width: 600, height: 300 }, size)
  margin = dvl.def({ top: 30, bottom: 70, left: 70, right: 30 }, "margin")

  dvl.resizer size, null, {
    selector:   selector
    minWidth:   350
    maxHeight:  300
    minHeight:  300
  }

  panel = dvl.svg.canvas {
    selector: selector
    size:     size
    margin:   margin
  }

  sx = dvl.scale.linear {
    name:       "scale_x"
    domain:
      data:   data
      acc:    getX
      sorted: true
    rangeFrom:  0          
    rangeTo:    panel.width
    padding:    rawPadding           
  }                      
  
  yDomains = ({ data: data, acc: getYs[what] } for what in whats)             
               
  sy = dvl.scale.linear {        
    name:       "scale_y"   
    domain:     yDomains
    rangeFrom:  0
    rangeTo:    panel.height
    padding:    rawPadding
    scaleMax:   1.1
    anchor:     true
  }

  scaledTicksX = dvl.gen.fromArray(sx.ticks, null, sx.scale)
  scaledTicksY = dvl.gen.fromArray(sy.ticks, null, sy.scale)
  
  # x ticks
  dvl.svg.lines {
    panel:    panel
    duration: duration
    props:
      key:      sx.ticks
      left:     scaledTicksX
      top1:     0
      bottom2:  0
  }
  
  # y ticks
  dvl.svg.lines {
    panel:    panel
    duration: duration
    props:
      key:      sy.ticks
      bottom:   scaledTicksY
      left1:    0
      right2:   0
  }
  
  # axis
  dvl.svg.lines {
    panel:    panel
    duration: duration
    classStr: 'axis'
    props:
      bottom:   rawPadding
      left1:    0
      right2:   0
  }
  
  # labels
  dvl.svg.labels {
    panel:    panel
    duration: duration
    props:
      key:      sx.ticks
      left:     scaledTicksX
      bottom:   -3
      text:     dvl.gen.fromArray(sx.ticks, null, sx.format)
      baseline: "top"
      align:    "middle"
  }

  # y ticks
  dvl.svg.labels {
    panel:    panel
    duration: duration
    props:
      key:      sy.ticks
      left:     -3
      bottom:   scaledTicksY
      text:     dvl.gen.fromArray(sy.ticks, null, sy.format)
      align:    "end"
      baseline: "middle"
  }

  # y ticks
  if type is 'line'
    for what in whats
      dvl.svg.line {
        panel:    panel
        duration: duration
        classStr: what
        props:
          key:      dvl.gen.fromArray(data, getX)
          left:     dvl.gen.fromArray(data, getX, sx.scale)
          bottom:   dvl.gen.fromArray(data, getYs[what], sy.scale)
      }
      
  else if type is 'bar'
    barWidth = dvl.apply {
      invalid:  10
      args:     [panel.width, data]
      fn: (w, d) ->
        if d.length
          w/d.length * 0.7
        else
          10
    }
    
    for what in whats
      dvl.svg.bars {
        panel:    panel
        duration: duration
        classStr: what
        props:
          key:      dvl.gen.fromArray(data, getX)
          centerX:  dvl.gen.fromArray(data, getX, sx.scale)
          width:    barWidth
          bottom:   rawPadding + 1
          height:   dvl.gen.fromArray(data, getYs[what], sy.scale)
      }
  
  main_number = (w) ->
    dvl.html.out {
      selector: "##{ w }_main_number"
      data: data
      format: (d) -> 
        if d and d.length > 0
          avg = 0
          avg += item[w] for item in d
          avg = avg / d.length
          
          return if humanize
            humanize_number(avg)
          else
            avg.toFixed(0)
        else
          return ''
    }
    
  # Make average number 
  for what in whats    
    main_number(what)
