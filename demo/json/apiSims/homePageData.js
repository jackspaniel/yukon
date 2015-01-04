module.exports = function(app) {
  return {
    route : '/api/data/homeslices',

    middlewares: [
      function(req, res, next) {
        req.nodule.debug('home page data API called');
        var returnObj = {msg: 'NORMAL home page data API success!'};
        if (req.query.isSpecial) returnObj.specialMsg = 'SPECIAL home page data API success!';
        res.send(returnObj);
      }
    ]     
  };
};