// wraps nodule.preProcessor, called after app-level appStart middleware

module.exports = function(app, config) {
  return function(req, res, next) {
    config.customDebug('yukon-preApi')('called');

    req.nodule.preProcessor(req, res);

    next();
  };
};