// basic page example with multiple API calls, serving multiple routes, setting nodule propertes at request time

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/', '/home', '/special'],

    apiCalls: [
      {path: '/api/cms/home'},       // comes to postProcessor as res.locals.data1
      {path: '/api/data/homeslices'} // comes to postProcessor as res.locals.data2
    ],
  
    // business logic before API calls are made
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // MAGIC ALERT: if no templateName is specified the framework looks for [module name].[template extension]

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
      var clientMsg = res.locals.data2.specialMsg || res.locals.data2.msg;

      // MAGIC ALERT: if no res.renderData isn't specified, the framework uses res.locals.data1

      // res.renderData is the base object sent to jade template
      res.renderData = {
        cmsData: res.locals.data1,
        myData: res.locals.data2,
        clientMsg: clientMsg
      };
    }
  };
};

