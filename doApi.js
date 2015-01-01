var fs = require('fs');
var path = require('path');
var debug;

// calls all APIs in parallel (inlcuding those added by the app-level appDoApi middleware)
module.exports = function(app, config) {
  debug = config.debug('yukon->doApi');

  var api = require('./api.js')(app, config);

  // called as route comes in, before it goes to API
  return function(req, res, next) {
    debug("called");
    console.log(req.nodule.apiCalls);
    if (req.nodule.apiCalls.length > 0) {

      var dataIdx = 1;
      req.nodule.apiCalls.forEach(function(apiCall, index) {
        if (!apiCall.namespace) apiCall.namespace = "data" + dataIdx++;
      });

      parallel(req.nodule.apiCalls, req, res, next);
    }
    else {
      next();
    }
  };

  // invokes N number of api calls, then invokes the express next() when all have returned or one returns an error
  function parallel(apiCalls, req, res, next) {
    debug('parallel started!! # calls:' + apiCalls.length);
    var results = 0;
    var errorReceived = null;

    apiCalls.forEach(function(apiCall){
      api.getData(apiCall, req, res, function(err){
        if (err && !errorReceived) { 
          errorReceived = err; 
          next(err); // if any error - send full request into error flow, exit out of parallel calls
        }

        results++;
        if (!errorReceived && results === apiCalls.length) {
          debug('parallel done!!');
          next(); // if all calls return successfully call the express next()
        }
      });
    });
  }
};
