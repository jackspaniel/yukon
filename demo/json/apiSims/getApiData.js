module.exports = function(app) {
  return {
    route : '/api/getdata/:id',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('get data API called for id: ' + req.params.id);
        
        var returnObj = {msg: 'get data success! id='+req.params.id+', myParam='+req.query.myParam};

        console.log(req.host);

        if (req.params.id === 'specialsink') returnObj.specialsink = "success";
        
        res.send(returnObj);
      }
    ]     
  };
};