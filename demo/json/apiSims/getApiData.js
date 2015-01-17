// simulates API call for testing and demo app

module.exports = function(app) {
  return {
    route : '/api/getdata/:id',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('get data API called for id: ' + req.params.id);
        
        var returnObj = {
          msg: 'get data success! id='+req.params.id,
          queryPrams: req.query
        };
        
        res.send(returnObj);
      }
    ]     
  };
};