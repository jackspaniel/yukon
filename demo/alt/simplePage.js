// BASIC PAGE TO RUN OFF THE ALT DEMO APP (to get complete test coverage)

// FEATURES DEMONSTRATED:

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/alt'],

    apiCalls: [{path:'/api/cms/home'}]
  };
};

