$ ->

  xy = d3.geo.mercator().scale(1200)
  chart = d3.select("#canvas")
            .append("svg:svg")
  path = d3.geo.path().projection(xy)

  d3.json "/map", (collection) ->
    chart.selectAll("path")
      .data(collection.features)
      .enter().append("svg:path")
      .attr("d", path)
      .append("svg:title")
      .text((d) -> d.properties.name)

  
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
