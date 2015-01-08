// BASIC PAGE EXAMPLE

// FEATURES DEMONSTRATED:
// multiple routes (nodulejs functionality)
// multiple API calls
// adding API params at request time
// "magic" templateName based on this filename
// alternate templateName set at request time
// pre and post API business logic
// creating res.yukon.renderData object which goes to template as base object
// global API call is added by app (res.yukon.renderDataglobalNav)
// preData and postData middlware functions (res.yukon.renderDataglobalNav.deviceType)

// for more demonstration of yukon features - see kitchenSink.js, getSpecificData.js, getData.js, 404.js, submitForm.js

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/', '/home', '/special'],

    apiCalls: [
      {path: '/api/cms/home'},       // comes to postProcessor as res.yukon.data1
      {path: '/api/data/homeslices'} // comes to postProcessor as res.yukon.data2
    ],
  
    // business logic before API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // MAGIC ALERT: if no templateName is specified the framework looks for [module name].[template extension] (default=.jade)

      // example of specifying nodule properties at request time
      if (req.path.indexOf('special') > -1) {
        this.apiCalls[1].params = {isSpecial: true}; // add extra param to existing API call
        this.templateName = 'altHomePage.jade';      // select alternate template
      }
    },
    
    // business logic after all API calls return
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // example of post API business logic
      var clientMsg = res.yukon.data2.specialMsg || res.yukon.data2.msg;

      // MAGIC ALERT: if no res.yukon.renderData isn't specified, the framework uses res.yukon.data1

      // res.yukon.renderData is the base object sent to jade template
      res.yukon.renderData = {
        globalNav: res.yukon.globalNav,
        cmsData: res.yukon.data1,
        myData: res.yukon.data2,
        clientMsg: clientMsg
      };
    }
  };
};

