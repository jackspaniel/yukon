var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var demoApp = require('./demo/demoApp');

app.set('view engine', 'jade');
app.set('view options', { layout: false });

app.use(bodyParser());

demoApp(app);

app.listen(process.env.PORT || 3000);
console.log("Listening on port: " + (process.env.PORT || 3000));

