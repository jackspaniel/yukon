// wraps nodule.preProcessor, called after app-level start middleware

module.exports = function(app, config) {
  return function(req, res, next) {
    config.customDebug('yukon-preData')('called');

    req.nodule.preProcessor(req, res);

    res.yukon = {}; // set this here on the off chance app preData needs to do something with it

    next();
  };
};