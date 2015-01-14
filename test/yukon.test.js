// FEATURES TESTED:

var glob  = require('glob');
var path  = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var demoApp = require('../demo/demoApp');

describe('demoApp/yukon API framework test suite', function(){

  var app = express();
  app.use(bodyParser.json());
  demoApp(app, {debugToConsole: false}); // set true to debug

  // find and execute individual nodule test files
  glob.sync('./**/*.test.js', { cwd: 'demo' })
    .forEach(function(file) { require(path.join(process.cwd(), 'demo', file))(app); });

  // require(path.join(process.cwd(), 'demo/json/submitForm.test.js'))(app);
});



