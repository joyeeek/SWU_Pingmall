var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var fs = require('fs');
var router = express.Router();

app.set('port',(process.env.PORT || 3100));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(app.get('port'), () => {
	console.log(`app listening on port ${app.get('port')}`);
});


var router = require('./router/main')(app, fs);
