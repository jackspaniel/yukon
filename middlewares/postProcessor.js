// wraps nodule.postProcessor, called after API calls return

var path = require('path');

// wraps nodule.postProcessor, called after all API calls return
module.exports = function(app, config) {
  var debug = config.customDebug('yukon->postData');

  return function(req, res, next) {
    debug("called");

    var nodule = req.nodule;
    // execute nodule-level post API business logic
    nodule.postProcessor(req, res);

    // nodules can throw their own errors on certain conditions
    if (nodule.error) {
      next(nodule.error);
      return;
    }

    // convenience method so devs don't have to set renderData for default single API case
    if (!res.yukon.renderData)
      res.yukon.renderData = res.yukon.data1 || {};

    if (req.nodule.contentType !== 'json') {
      // if template name is not specified assume (nodule name).(nodule extention)
      var templateName = (nodule.templateName) ? nodule.templateName : nodule.name + nodule.templateExt;
      res.templatePath =  (templateName.indexOf('/') > -1) 
                          ? path.join(process.cwd(), templateName) 
                          : path.join(nodule.path, templateName);
    }
    debug('res.templatePath = ' + res.templatePath);

    next();
  };
};