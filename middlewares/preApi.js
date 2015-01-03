// wraps nodule.preProcessor, called after app-level appPreApi middleware

module.exports = function(app, config) {
  return function(req, res, next) {
    config.debug('yukon-preApi')('called');

    req.nodule.preProcessor(req, res);

    next();
  };
};