// EXHAUSTIVE EXAMPLE NODULE - attempts to incorporate as many yukon features as possible 

// FEATURES DEMONSTRATED:
// multiple routes (nodulejs functionality)
// multiple APIs
// adding static API params at nodule init time
// adding API params to existing params obejct at request time
// adding API params by creating new params obejct at request time
// "magic" templateName based on this filename
// alternate templateName
// alternate templateName with path to folder
// "magic" stubPath based on this filename
// stubPath defined
// adding API call at request time
// "magic" adding :id route wildcard to API path ending in / (common REST paradigm)
// custom API headers 
// alternate API host
// custom API timeout
// force content type json
// "throw" error from postProcessor (app calls next(nodule.error))

// see submitForm.js for POST example, also see getData.js, getSpecificData.js, homePage.js, 404.js

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route: ['/kitchensink', '/bathroomtub/:id'], // set :id = "specialsink" to test

    apiCalls: [
      {path: '/api/cms/home'}, // comes to postProcessor as res.yukon.data1
      {path: '/api/getdata/kitchensink', params:{staticParam: 'test1'}},
      {path: '/api/getdata/somecall/', useStub: true},
      {path: '/api/getdata/someothercall/', useStub: true, stubPath: 'altKitchenSink'} 
    ],
  
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      this.apiCalls[1].customHeaders = [{name: 'x-test', value: 'success'}]; 

      // test "magic" adding :id when api path ends with /
      // also testing adding apiCall at request-time
      if (req.path.indexOf('bathroomtub') > -1) this.apiCalls.push({path: '/api/getdata/'}); 

      // adding query params two different ways (in real life don't forget to sanitize query params!)
      if (req.query.myParam) {
        this.apiCalls[0].params = {myParam: req.query.myParam}; // creating API params object because it hasn't been defined yet
        this.apiCalls[1].params.myParam = req.query.myParam; // adding to existing API params
      }

      // setting alternamte template name
      if (req.query.altTemplateName) this.templateName = 'altKitchenSink.jade';

      // setting alternamte template path (app starts looking from process.cwd() by default)
      if (req.query.altTemplatePath) this.templateName = './demo/homePage/altTemplatePath.jade';

      // setting alternamte api host
      if (req.query.altApiHost) this.apiCalls[1].host = 'localhost:'+req.headers.host.split(':')[1]; 
      
      // setting alternatte API timeout
      if (req.query.apiTimeout) this.apiCalls[1].timeout = 1; 
      
      // changing content type to JSON at request-time
      if (req.query.forceJson) this.contentType = 'json'; 
    },
    
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      if (req.query.testError) {
        this.error = 'Kitchen Sink Test Error!';
        return;
      }

      res.yukon.renderData = {
        data1: res.yukon.data1,
        data2: res.yukon.data2,
        data3: res.yukon.data3,
        data4: res.yukon.data4,
        data5: res.yukon.data5,
      };
    }
  };
};