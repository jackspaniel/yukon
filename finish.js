// called dead last in middleware chain, sends response to client

module.exports = function(app, config) {

  return function(req, res, next) {
    config.debug('yukon->finish')('called');

    if (req.nodule.contentType === 'json')
      res.json(res.renderData);
    else
      res.render(res.templatePath, res.renderData);
  };
};
