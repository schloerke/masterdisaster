xy = d3.geo.mercator().scale(1200)
chart = d3.select("canvas")
          .append("svg:svg")
path = d3.geo.path().projection(xy)
###
d3.json "/map", (collection) ->
  chart.selectAll("path")
    .data(collection.features)
    .enter().append("svg:path")
    .attr("d", path)
    .append("svg:title")
    .text((d) -> d.properties.name)
###

