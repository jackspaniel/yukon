// wraps nodule.preProcessor, called after app-level appStart middleware

module.exports = function(app, config) {
  return function(req, res, next) {
    config.customDebug('yukon-preApi')('called');

    req.nodule.preProcessor(req, res);

    res.yukon = {}; // set this here on the off chance app preApi needs to do something with it

    next();
  };
};