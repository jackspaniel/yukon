// FEATURES TESTED:

var glob  = require('glob');
var path  = require('path');
var express = require('express');
var demoApp = require('../demo/demoApp');
var altDemoApp = require('../demo/altDemoApp');

describe('demoApp/yukon component framework test suite', function(){

  it('should register all routes for main app', function(done){
    var app = demoApp(null); // set true to debug
  
    // find and execute individual nodule test files
    glob.sync('./**/*.test.js', { cwd: 'demo' })
      .filter(function(file) { 
        if (file.indexOf('alt/') === -1) return true; 
        else return false;
      })
      .forEach(function(file) { require(path.join(process.cwd(), 'demo', file))(app); });

    done();
  });
});

describe('alt demoApp test suite - for stuff like optional components', function(){

  it('should register all routes for alt app', function(done){
    var app = altDemoApp(null, {debugToConsole: true}); // set true to debug

    // find and execute individual nodule test files
    glob.sync('./**/*.test.js', { cwd: 'demo/alt' })
      .forEach(function(file) { require(path.join(process.cwd(), 'demo/alt', file))(app); });

    done();
  });
});





