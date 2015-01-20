// calls all APIs in parallel (inlcuding those added by the app-level preData middleware)

module.exports = function(app, config) {
  var debug = config.customDebug('yukon->parallel-api->doApi');

  var api = require('./api.js')(app, config);

  // called as route comes in, before it goes to API
  return function(req, res, next) {
    debug("called");
    if (req.nodule.apiCalls.length > 0) {

      var dataIdx = 1;
      req.nodule.apiCalls.forEach(function(apiCall, index) {
        if (!apiCall.namespace) apiCall.namespace = "data" + dataIdx++;
      });

      parallelApis(req.nodule.apiCalls, req, res, next);
    }
    else {
      next();
    }
  };

  // invokes N number of api calls, then invokes the express next() when all have returned or one returns an error
  function parallelApis(apiCalls, req, res, next) {
    debug('parallelApis started!! # calls:' + apiCalls.length);

    var results = 1;
    apiCalls.forEach(function(apiCall){
      api.getData(apiCall, req, res, function(err){
        if (err) { 
          next(err); // if any error - send full request into error flow, exit out of parallelApi calls
          return;
        }

        if (results++ === apiCalls.length) {
          debug('parallelApis done!!');
          next(); // if all calls return successfully call the express next()
        }
      });
    });
  }
};
