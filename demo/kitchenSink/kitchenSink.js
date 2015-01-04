// attempting to incorporate as many yukon features as possible 
// for testing and demonostration purposes
// (see submitForm.js for verb=post, bodyType=form/json example)

// FEATURES INCORPORATED:
// multiple routes
// multiple APIs
// "magic" templateName based on this filename
// alternate defined templateName
// template in alternate folder
// stubPath defined
// "magic" stubPath based on this filename
// adding api call at request time
// "magic" adding :id to api path ending in /
// custom api headers
// alternate api host
// send error from postProcessor
// custom api timeout
// force content type json

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/kitchensink', '/bathroomtub/:id'], // set :id = "specialsink" to test

    apiCalls: [
      {path: '/api/cms/home'}, // comes to postProcessor as res.locals.data1
      {path: '/api/getdata/kitchensink'},
      {path: '/api/getdata/somecall/', useStub: true},
      {path: '/api/getdata/someothercall/', useStub: true, stubPath: 'altKitchenSink'} 
    ],
  
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 

      // test "magic" adding :id when api path ends with /
      // also testing adding apiCall at request-time
      if (req.path.indexOf('bathroomtub') > -1) this.apiCalls.push({path: '/api/getdata/'}); 

      if (req.query.altTemplateName) this.templateName = 'altKitchenSink';
      if (req.query.altTemplatePath) this.templateName = '/node_modules/yukon/demo/homePage/templateTest';
      if (req.query.altApiHost)      this.apiCalls[1].host = 'localhost:3000'; 
      if (req.query.apiTimeout)      this.apiCalls[1].timeout = 1; 
      if (req.query.forceJson)       this.contentType = 'json'; 
    },
    
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      if (req.query.testError) {
        this.error = 'Error!';
        return;
      }

      res.renderData = {
        data1: res.locals.data1,
        data2: res.locals.data2,
        data3: res.locals.data3,
        data4: res.locals.data4,
        data5: res.locals.data5,
      };
    }
  };
};