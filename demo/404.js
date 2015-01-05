// 404 "CATCH ALL" EXAMPLE - high route index is used to load '*' route last

// FEATURES DEMONSTRATED:
// using high routeIndex to load a route last in the express route stack (nodulejs functionality)
// custom middleware array (bypasses standard app/yukon middleware chain)

// for more demonstration of yukon features - see kitchenSink.js, homePage.js, getData.js, getSpecificData.js, submitForm.js

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: '*',

    // set to low number to register route with express first
    // set to high number to register last (can be negative - like z-index)
    // (routes registered first take precedence)
    routeIndex: 1000,
  
    // example of using custom non-standard middleware array 
    middlewares: [
      function(req, res, next) {
        req.nodule.debug('404 error middleware called! for ' + req.path);
        res.send('<html><body><h1>404 error!</h1></body></html>');
      }
    ]
  };
};