fs = require('fs')
opts = require('tav').set();
# console.log(opts, opts.args);

port = if opts.port? then opts.port else 8080

# Module dependencies
express     = require('express')
app         = express.createServer()



# config = (dir_str, express, app, helpers) ->
process.on 'uncaughtException', (err) ->
  console.error("Caught uncaughtException: #{err}")
  null
app.use(express.bodyParser())  # form support
app.use(express.logger({ format: ':method\t:response-timems\t:url' }))
app.set('view engine' , 'ejs')
app.set('view options', {layout: false})
app.set('view'        , "#{__dirname}/views/") # default!
app.set('partials'    , "#{__dirname}/views/partials/") # default!
app.use(express.static("#{__dirname}/static/"))
# null

 # Helpers for pages
app.dynamicHelpers { 
  session: (req, res) -> 
    return req.session
   
  verbose: (req, res) ->
    return true
}

# Test
app.all( '/',   (req, res, next) -> res.render("test"))

mapInfo = JSON.parse(fs.readFileSync("data/world-countries.json"))
app.all( "/map", (req, res, next) -> res.send(mapInfo))
gdpInfo = JSON.parse(fs.readFileSync("data/gdp_pop.json"))
app.all( "/gdp", (req, res, next) -> res.send(gdpInfo))

app.all(  '/*',   (req, res, next)-> res.redirect("/"))


# Start!
app.listen(port)
console.log('Express app started on port ' + port)




