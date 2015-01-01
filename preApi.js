// wraps nodule.preProcessor, called after app-level appPreApi middleware
module.exports = function(app, config, api) {
  return function(req, res, next) {
    config.debug('yukon-preApi')('called');

    req.nodule.preProcessor(req, res);

    // TDOO - research if this is somehow a bad idea
    req.nodule.callApi = api.callApi; // set ref to api caller for app to use

    next();
  };
};