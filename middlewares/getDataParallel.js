// default data-gatherind middleware - calls all specified plugins in parallel

module.exports = function(config) {
  var debug = config.customDebug('yukon->getDataParallel');

  return function(req, res, next) {
    debug('called');

    parallelMiddlewares(config.pluginMiddlewares, req, res, next);
  };

  function parallelMiddlewares(middlewares, req, res, next) {
    debug('parallelMiddlewares started!! # of middlewares: ' + middlewares.length);

    var results = 0;
    var errorReceived = null;
    middlewares.forEach(function(middleware) {
      middleware(req, res, function(err) {
        if (err && !errorReceived) { 
          errorReceived = err; 
          next(err); // if any error - send full request into error flow, exit out of parallel data calls
          return;
        }

        results++;
        if (!errorReceived && results === middlewares.length) {
          debug('parallelMiddlewares done!!');
          next(); // when all calls return, call the express middleware next()
        }
      });
    });
  }
};

