// BASIC FORM SUBMIT EXAMPLE

// FEATURES DEMONSTRATED:
// setting route verb to POST
// setting API verb to POST
// setting api body request type to 'form' ('form'=url-encoded, 'json'=json body)
// adding API params at request time
// pre and post API business logic
// creting res.yukon.renderData object which goes to template as base object

// for more demonstration of yukon features - see kitchenSink.js, getSpecificData.js, getData.js, 404.js, homePage.js

var _ = require('lodash');

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route : '/json/submitForm',  

    routeVerb: 'post', // default = get       
    
    apiCalls: [{
      path: '/api/submitform',
      verb: 'post',
      bodyType: 'form', // default = 'json'
    }],

    preProcessor: function(req, res) {
      this.debug('preProcessor called');
      
      // process request parameters, do business logic here before calling API(s)

      // in real life don't forget to sanitize query params!
      if (!_.isEmpty(req.body)) {
        // change form body type sent to API
        this.apiCalls[0].bodyType = 'json';

        this.apiCalls[0].params = req.body; // JSON body
      }
      else {
        this.apiCalls[0].params = req.query; // url-encoded
      }
    },

    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      // process API results here before sending data to jade/client
      
      res.yukon.renderData = {
        response: res.yukon.data1
      };
    }
  };
};