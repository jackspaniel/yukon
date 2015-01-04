var assert  = require('assert');
var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var demoApp = require('../demo/demoApp');

var app = express();
app.use(bodyParser.json());
demoApp(app, {debugToConsole: false});

describe('demoApp/yukon API framework test suite', function(){

  describe('Testing multiple routes (home page) - GET /home', function(){
    it('should respond with home page HTML', function(done){
      request(app)
        .get('/home')
        .end(function(err, res){
          assert(res.text.indexOf('<h1>HOME PAGE') > -1, 'res.text='+res.text);
          done();
        });
    });
  });
});