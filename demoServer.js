var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var demoApp = require('./demo/demoApp');
var altDemoApp = require('./demo/altDemoApp');

app.set('view engine', 'jade');
app.set('view options', { layout: false });

app.use(bodyParser.urlencoded({extended: false, limit: "500kb"}));
app.use(bodyParser.json({limit: "500kb"}));

(process.argv[2] === '--alt') ? altDemoApp(app) : demoApp(app);

app.listen(process.env.PORT || 3000);
console.log("Listening on port: " + (process.env.PORT || 3000));

