$ ->

  xy = d3.geo.mercator().scale(1200)
  chart = d3.select("#canvas")
            .append("svg:svg")
  path = d3.geo.path().projection(xy)
  
  
  collection = dvl.json2 {
    url: "/map"
    fn: (data) -> return data
  }
  
  dvl.register {
    listen: [collection]
    fn: ->
      col = collection.get()
      return null if not col?
      
      chart.selectAll("path")
        .data(col.features)
        .enter().append("svg:path")
        .attr("d", path)
        .append("svg:title")
        .text((d) -> d.properties.name)
      null
  }
  
  
  
  
  i = 0
  $("#scale").slider {
    min:    0
    max:    3000
    value:  500
    step:   1
    slide:  (event, ui) ->
      # TODO: animate time
      null
      console.log("oh hai! - #{i++}")
  }
