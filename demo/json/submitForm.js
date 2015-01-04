// basic post form-submit example

module.exports = function(app) {
  return {
    // routes can be a string, RegExp or array of either (to match multiple routes)
    route : '/json/submitForm',  

    routeVerb: 'post', // default = get       
    
    apiCalls: [{
      path: '/api/submitform',
      verb: 'post',
      bodyType: 'form', // default = 'json', express bodyParser turns both into req.body JSON object so it doesn't matter here
    }],

    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      // in real life don't forget to sanitize query params!
      this.apiCalls[0].params = req.body;
    },

    postProcessor: function(req, res) {
      this.debug('postProcessor called');
      
      res.renderData = {
        msg: res.locals.data1.msg
      };
    }
  };
};