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

        if (req.params.id === 'specialsink') returnObj.specialsink = "success";
        
        res.send(returnObj);
      }
    ]     
  };
};