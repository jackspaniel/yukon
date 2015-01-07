// NEGATIVE ROUTE INDEX EXAMPLE - specific matching route is loaded ahead of more general matching route

// FEATURES DEMONSTRATED:
// using a RegExp in a route (express functionality)
// using negative routeIndex to load a route first in the express route stack (nodulejs functionality)
// modifying API path at request time

// for more demonstration of yukon features - see kitchenSink.js, homePage.js, getData.js, 404.js, submitForm.js

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

      res.yukon.renderData = {
        systemMsg: res.yukon.data1.systemMsg,
        msg: res.yukon.data1.msg
      };
    }
  };
};
