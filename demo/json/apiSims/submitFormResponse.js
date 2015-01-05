// simulates API call for testing and demo app

module.exports = function(app) {
  return {
    route : '/api/submitform',

    routeVerb: 'post',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('submit form API called');

        res.send({
          msg: 'submit form success!',
          reqBody: req.body,
          reqQuery: req.query
        });
      }
    ]     
  };
};