$ ->
  
  status = {}
  
  xy = d3.geo.mercator().scale(1200)
  translate = xy.translate()
  translate[0] = 450
  translate[1] = 285
  xy.translate(translate)
  chart = d3.select("#canvas")
            .append("svg:svg")
  path = d3.geo.path().projection(xy)
  
  
  
  timeMin = 1950
  timeMax = 2010
  time = dvl.def(timeMin, "time")
  allow_increment = dvl.def(false, "allow_increment")
  
  dvl.html.out {
    selector: "#scale_label"
    data:     time
    format: (d) -> return d
  }
  
  
  increment_time = ->
    
    t = time.get()
    if t is timeMax
      pause()
    else
      t += 1
      time.set(t).notify()
    
  
  window.play = ->
    status.interval = setInterval(increment_time, 1000)
    null
  window.pause = ->
    status.interval = clearInterval(status.interval)
    null
    
  dvl.register {
    listen: [time]
    fn: ->
      t = time.get()
      $("#scale").slider("option", "value", t)
      null
  }
  
  
  
  
  
  
  collection = dvl.json2 {
    url: "/map"
  }
 
  gdptemp = dvl.json2 {
    url: "/gdp"
    fn: (d) ->
      newGdp = {}
      for row in d.rows
        newGdp[row.year] or= {}
        newGdp[row.year][row.country] = {
          country_isocode: row["country isocode"]
          pop: row.POP
          rgdpch: row.rgdpch
        }
      return newGdp
  }

  gdp = dvl.apply {
    args: [gdptemp, collection]
    fn: (g, col) ->
      for year,val of g
        for country,countryval of val
          for feature in col.features
            if country is feature.properties.name
              countryval.svgObj = feature
              break
      return g
  }
 
  yearData = dvl.apply {
    args: [gdp, time]
    fn: (g,t) ->
      return g[t]
  }

  dvl.register {
    listen: [yearData]
    fn: ->
      yd = yearData.get()
      return null if not yd?
      svgs = (val.svgObj for key,val of yd)
      chart.selectAll("path")
        .data(svgs)
        .enter().append("svg:path")
        .attr("d", path)
        .attr("class", quantize)
        .append("svg:title")
      null
  }

  dvl.register {
    listen: [collection]
    fn: ->
      window.col = collection.get()
      return null if not col?
      
      chart.selectAll("path")
        .data(col.features)
        .enter().append("svg:path")
        .attr("d", path)
        .append("svg:title")
        .text((d) -> d.properties.name)
      null
  }

  dvl.register {
    listen: [gdp]
    fn: ->
      col = gdp.get()
      return null if not col?
  }

  i = 0
  $("#scale").slider {
    min:    timeMin
    max:    timeMax
    value:  500
    step:   1
    slide:  (event, ui) ->
      time.set(ui.value).notify()
  }

  $("#play").click(play)
  $("#pause").click(pause)

  quantize = (d) ->
    console.log 'wur'
    ###
     return ("q" + Math.min(8, ~~(d.rgdpch * 9 / 12)) + "-9")
    ###
