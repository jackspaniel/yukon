var fs = require('fs');
var _ = require('lodash');
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
    else if (!callArgs.apiPath)
      next();
    else 
      getData(req, res, next, callArgs);
  }

  // call live API - return data as res.locals[namespace] (namespace = data1, data2, data3 etc. for component level API calls)  
  function getData(req, res, next, callArgs) {
    debug('getData called, namespace = ' + callArgs.namespace);

    // if path ends with '/', assume it needs an id
    callArgs.apiPath     = callArgs.apiPath.match(/\/$/) ? callArgs.apiPath + req.params.id : callArgs.apiPath;
    callArgs.apiVerb     = callArgs.apiVerb || 'get';
    callArgs.apiParams   = callArgs.apiParams || {};
    callArgs.apiBodyType = callArgs.apiBodyType || 'json';
    callArgs.paramMethod = (callArgs.apiVerb === 'get') ? 'query' : 'send';

    // TODO - assuming http to API server, should probably be customizable
    var apiServer = callArgs.apiHost ? 'http://' + callArgs.apiHost : config.apiServer;

    callArgs.apiPath = apiServer + callArgs.apiPath; // we don't want the apiServer in timer results

    // set status codes to handle at the component level rather than framework level
    var validStatusCodes = _.clone(config.defaultValidStatusCodes || []);
    if (typeof callArgs.handleError === 'number')
      validStatusCodes.push(callArgs.handleError);
    else if (callArgs.handleError instanceof Array)
      validStatusCodes = validStatusCodes.concat(callArgs.handleError);
    
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
      config.afterApiCall(callArgs, response, req, res);

      var error = true, errorHandledByComponent = false;
      if (!err && response.body && (callArgs.handleError === true || validStatusCodes.indexOf(response.statusCode) > -1)) { 
        error = null;
        errorHandledByComponent = true;
        res.locals[callArgs.namespace] = response.body;
        res.locals[callArgs.namespace].statusCode = response.statusCode;
        config.onApiSuccess(response, callArgs, req, res);
      }

      // do error logic if we see certain errors, even if handled by component
      if (error || (errorHandledByComponent && config.defaultValidStatusCodes.indexOf(response.statusCode) === -1 && response.body.errors)) {
        config.onApiError(err, response, callArgs, req, res);
      }
    
      if ((!error || errorHandledByComponent) && callArgs.callback) {
        error = null;
        callArgs.callback(req, res);
      }

      setTimeout(function() { next(error); }, req.nodule.apiSleep); // simulates API taking a certain amount of time
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
    
    config.onApiSuccess(data, callArgs, req, res);
    
    if (callArgs.callback) callArgs.callback(req, res);
    
    setTimeout(function() { next(); }, req.nodule.apiSleep); // simulates API call
  }
};