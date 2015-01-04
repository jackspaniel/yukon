module.exports = function(app) {
  return {
    route : '/api/globalnav',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('global nav API called');
        res.send({msg: 'global nav success!'});
      }
    ]     
  };
};