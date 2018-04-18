
var express = require('express'),
  app = express(),
  port = process.env.PORT || 3550;

var cors = require('cors');

app.use(cors());
var routes = require('./api/routes/todoListRoutes'); //importing route
routes(app); //register the route


app.listen(port);

/*app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});*/

console.log('todo list RESTful API server started on: ' + port);