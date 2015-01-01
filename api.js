var fs = require('fs');
var sa = require('superagent');

module.exports = function(app, config) {
  var debug = config.debug('yukon->api');

  return { 
    callApi: callApi,
  };

  // route call to get stub or use live API
  function callApi(req, res, next, callArgs) {
    debug("callApi called, callArgs = " + callArgs);

    if (callArgs.stubPath) 
      readStub(req, res, next, callArgs);
    else 
      getData(req, res, next, callArgs);
  }

  // call live API - return data as res.locals[namespace] (namespace = data1, data2, data3 etc. for component level API calls)  
  function getData(req, res, next, callArgs) {
    debug('getData called, namespace = ' + callArgs.namespace);

    // if path ends with '/', assume it gets an id from the express request :id matcher
    callArgs.apiPath     = callArgs.apiPath.match(/\/$/) ? callArgs.apiPath + req.params.id : callArgs.apiPath;
    callArgs.apiVerb     = callArgs.apiVerb || 'get';
    callArgs.apiParams   = callArgs.apiParams || {};
    callArgs.apiBodyType = callArgs.apiBodyType || 'json';
    callArgs.paramMethod = (callArgs.apiVerb === 'get') ? 'query' : 'send';
    
    config.beforeApiCall(callArgs, req, res);

    var call = sa
                 [callArgs.apiVerb](callArgs.apiPath)
                 [callArgs.paramMethod](callArgs.apiParams)
                 .type(callArgs.apiBodyType) 
                 .timeout(callArgs.timeout);

    callArgs.customHeaders.forEach(function(header) {
      call.set(header.name, header.value);
    });

    call.end(function(err, response) {
      if (!err && response.body) { 
        res.locals[callArgs.namespace] = response.body;
        res.locals[callArgs.namespace].statusCode = response.statusCode;
      }
      
      callArgs.apiError = err;
      callArgs.apiResponse = response;

      if (config.afterApiCall)
        config.afterApiCall(callArgs, req, res, next);
      else 
        next(err);
    });
  }

  // return stub data as res.locals[namespace] (namespace = data1, data2, data3 etc. for component level API calls)
  function readStub(req, res, next, callArgs) {
    debug('loooking for stub - ' + callArgs.stubPath);

    var data = {};
    try {
      data = fs.readFileSync(callArgs.stubPath);
      debug('stub found!, namespace='+callArgs.namespace);
    }
    catch(e) {
      debug('stub not found!');
      next();
      return;
    }

    res.locals[callArgs.namespace] = JSON.parse(data);
    
    if (config.afterStubCall)
      config.afterStubCall(callArgs, req, res, next);
    else 
      next();
  }
};