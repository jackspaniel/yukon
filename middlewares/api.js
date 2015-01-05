// custom middleware invoked by doAPI (not express middleware)
// handles individual API or stub call

var path = require('path');
var sa = require('superagent');
var fs = require('fs');
var _ = require('lodash');

module.exports = function(app, config) {
  var debug = config.customDebug('yukon->api');

  return { 
    getData: getData,
  };

  // route call to get stub or use live API
  function getData(callArgs, req, res, next) {
    debug("getData called");

    if (callArgs.useStub) 
      readStub(callArgs, req, res, next);
    else 
      callApi(callArgs, req, res, next);
  }

  // call live API - return data as res.locals[namespace] (namespace = data1, data2, data3 etc. for component level API calls)  
  function callApi(args, req, res, next) {

    debug('callApi called, namespace = ' + args.namespace);

    var callArgs = _.assign(_.cloneDeep(config.apiDefaults), args);
    callArgs.paramMethod = (callArgs.verb !== 'get' && callArgs.bodyType === 'json') ? 'send' : 'query';
   
    config.apiCallBefore(callArgs, req, res);

    if (callArgs.host) callArgs.path = callArgs.host + callArgs.path;

    // MAGIC ALERT: if path ends with '/', assume it gets an id from the express request :id matcher
    callArgs.path = callArgs.path.match(/\/$/) ? callArgs.path + req.params.id : callArgs.path;

    var call = sa
                 [callArgs.verb](callArgs.path)
                 [callArgs.paramMethod](callArgs.params)
                 .type(callArgs.bodyType) 
                 .timeout(callArgs.timeout);

    callArgs.customHeaders.forEach(function(header) {
      debug('adding custom header: '+header.name+'='+header.value);
      call.set(header.name, header.value);
    });

    call.end(function(err, response) {
      if (!err && response.body) { 
        res.locals[callArgs.namespace] = response.body;
        res.locals[callArgs.namespace].statusCode = response.statusCode;
      }
      
      callArgs.apiError = err;
      callArgs.apiResponse = response;

      if (config.apiCallback)
        config.apiCallback(callArgs, req, res, next);
      else 
        next(err);
    });
  }

  // return stub data as res.locals[namespace] same as API
  function readStub(callArgs, req, res, next) {
    // MAGIC ALERT: framework assumes the stub name = nodule name if no stubPath is supplied
    var stubName = callArgs.stubPath || req.nodule.name; 
    
    var stub = (stubName.indexOf('/') > -1) 
               ? path.join(process.cwd(), stubName) 
               : path.join(req.nodule.path, stubName+'.stub.json');
    
    debug('loooking for stub - ' + stub);

    var data = {};
    try {
      data = fs.readFileSync(stub);
      debug('stub found!, namespace='+callArgs.namespace);
    }
    catch(e) {
      next(new Error(debug('stub not found!')));
      return;
    }

    callArgs.apiResponse = {statusCode: 'STUB', req: {path: 'STUB: '+stubName}};

    res.locals[callArgs.namespace] = JSON.parse(data);
    
    if (config.apiCallback)
      config.apiCallback(callArgs, req, res, next);
    else 
      next();
  }
};