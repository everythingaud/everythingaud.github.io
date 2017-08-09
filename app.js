// This is the top level Express server application file.
var express = require('express');
var path = require('path');

var app = express();

// Set up handlebar templates
var exphbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

// Make files in the folder `public` accessible via Express
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('home');
});

// Start the express server
var port = process.env.PORT || '3000';
app.listen(port);
