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
  window.time = dvl.def(timeMin, "time")
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
 
  window.gdp = dvl.json2 {
    url: "/gdp"
    fn: (d) ->
      newGdp = {}
      for row in d.rows
        newGdp[row.year] or= {}
        newGdp[row.year][row.country] = {
          country_isocode: row["country isocode"]
          pop: row.POP
          rgdpch: if row.rgdpch is "na" then 0 else row.rgdpch
        }
      return newGdp
  }

  # window.gdp = dvl.apply {
  #   args: [gdptemp, collection]
  #   fn: (g, col) ->
  #     for year,val of g
  #       for country,countryval of val
  #         for feature in col.features
  #           if country is feature.properties.name
  #             countryval.svgObj = feature
  #             break
  #     return g
  # }
 
  window.yearData = dvl.apply {
    args: [gdp, time]
    fn: (g,t) ->
      return g[t]
  }
  
  
  window.all = dvl.json2 {
    url: "/all"
    fn: (d) ->
      
      makeDate = (dt) ->
        dt = "" + dt
        y = dt.substring(dt.length - 4)
        return parseInt(y, 10)
        
      rows = d.rows
      
      good = 0
      for row in rows
        # o.ut(true, "row: ", row)
        # 
        # o.ut(true, "row.End: ", row.End)
        # row.endYear = makeDate(row.End)
        row.startYear = makeDate(row.Start)
        
      ret = {}
      for row in rows
        if row.startYear >= 1950
          ret[row.startYear] or= []
          ret[row.startYear].push(row)
      
      return ret
  }
  
  window.get_all = ->
    a = all.get()
    
    t = {}
    i = 0
    for year, yearVal of a
      i++
      break if i > 5
      t[year] = yearVal
    return t
    null
     
  
  
  
  



  $("#scale").slider {
    min:    timeMin
    max:    timeMax
    value:  500
    step:   1
    slide:  (event, ui) ->
      time.set(ui.value).notify()
  }

  $("#play").click( -> play())
  $("#pause").click( -> pause())

