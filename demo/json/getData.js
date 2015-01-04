// basic JSON request example

module.exports = function(app) {
  return {
    route : '/json/getData/:id',       

    // MAGIC ALERT: if the api path ends in a / the framework appends :id (req.params.id) from the route
    apiCalls: [
      {path: '/api/getdata/'},
    ],

    // business logic before API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      this.apiCalls[0].params = req.query.myParam; // in real life don't forget to sanitize query params!
    
      if (req.query.doHtml) {
        req.contentType = 'html';
      }
    },
    
    // business logic after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      res.renderData = {
        systemMsg: res.locals.data1.systemMsg,
        msg: res.locals.data1.msg
      };
    }
  };
};