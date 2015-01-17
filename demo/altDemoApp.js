// alternate demo app to test lack of optional components

var _ = require('lodash');
var path = require('path');
var yukon = require('..');
var express = require('express');

module.exports = function(app, appConfig) {  
  app = app || express();

  var mergedConfig = _.merge(_.cloneDeep(config), appConfig);
  
  yukon(app, mergedConfig); 

  return app;
};

// since we're not sure where this demo app is being invoked
var myDir = __filename.substr(0,__filename.length-14);

// override nodulejs defaults
var config =  {

  debugToConsole: true, 

  // path(s) to look for your nodules 
  dirs: [
    { path: path.join(myDir, 'alt'), exclude: ['.test.js'] }, // exclude can be full or partal match
    { path: path.join(myDir, 'json/apiSims'), exclude: ['.test.js'] }, // exclude can be full or partal match
  ],

  middlewares: {
    preData: demoPreApi,
  },
};

function demoPreApi(req, res, next) {
  console.log("demoPreApi called");

  req.nodule.apiCalls[0].host = req.headers.host;

  next();
}


