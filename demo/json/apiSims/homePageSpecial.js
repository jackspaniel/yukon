module.exports = function(app) {
  return {
    route : '/api/data/specialhome',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('special extra home page API called');
        res.send({msg: 'special extra home page API success!'});
      }
    ]     
  };
};