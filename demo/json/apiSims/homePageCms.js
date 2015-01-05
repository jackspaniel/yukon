// simulates API call for testing and demo app

module.exports = function(app) {
  return {
    route : '/api/cms/home',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('home page API called');
        res.send({msg: 'home page CMS API success!', myParam:req.query.myParam});
      }
    ]     
  };
};