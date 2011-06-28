var app, disAll, express, fs, opts, port;
fs = require('fs');
opts = require('tav').set();
port = opts.port != null ? opts.port : 8080;
express = require('express');
app = express.createServer();
process.on('uncaughtException', function(err) {
  console.error("Caught uncaughtException: " + err);
  return null;
});
app.use(express.bodyParser());
app.use(express.logger({
  format: ':method\t:response-timems\t:url'
}));
app.set('view engine', 'ejs');
app.set('view options', {
  layout: false
});
app.set('view', "" + __dirname + "/views/");
app.set('partials', "" + __dirname + "/views/partials/");
app.use(express.static("" + __dirname + "/static/"));
app.dynamicHelpers({
  session: function(req, res) {
    return req.session;
  },
  verbose: function(req, res) {
    return true;
  }
});
app.all('/', function(req, res, next) {
  return res.render("index");
});
disAll = fs.readFileSync("data/global_disasters_all.json");
app.all("/all", function(req, res, next) {
  return res.send(disAll);
});
app.all('/*', function(req, res, next) {
  return res.redirect("/");
});
app.listen(port);
console.log('Express app started on port ' + port);