// JSON request example using negative routeIndex to register more specific routes first

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    // example of specific route that we want to match before /json/getData/:id
    route : /json\/getData\/(specialId1|specialId2)/,       

    // set to low number to register route with express first
    // high number to register last (can be negative - like z-index)
    // routes registered first take precedence
    routeIndex: -1,

    apiCalls: [{
      path: '/api/getdata/special/',
      params: {myParam:'specialsauce'}, // example of static api param set at app-init time
    }],

    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      this.apiCalls[0].path +=  req.params[0]; // adding id to api path when route :id isn't present
    },

    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // sent as JSON to client
      res.renderData = {
        systemMsg: res.locals.data1.systemMsg,
        msg: res.locals.data1.msg
      };
    }
  };
};
