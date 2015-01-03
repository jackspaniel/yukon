// simplistic example application for yukon API framework

var path = require('path');
var _ = require('lodash');
var yukon = require('..');
var debug;

module.exports = function(app, appConfig) {  
  var mergedConfig = _.merge(config, appConfig || {});
  yukon(app, mergedConfig); 

  debug = (appConfig.customDebug) 
          ? appConfig.customDebug('yukon->demoApp')
          : function(msg) { if (mergedConfig.debugToConsole) console.log('yukon->demoApp: ' + msg); };
};

// since we're not sure where this demo app is being invoked
var myDir = __filename.substr(0,__filename.length-11);

// override nodulejs defaults
var config =  {

  // path(s) to look for your nodules 
  dirs: [
    { path: myDir, exclude: ['demoApp.js', '.test.js'] }, // exclude can be full or partal match
  ],

  // set to true or or use customDebug: function(identifier) { return function(msg){... your debug function here ...} }
  debugToConsole: true, 


  /////////////////////////////////////////////////////////////  
  /// CUSTOM MIDDLEWARE SPLICED IN-BETWEEN YUKON MIDDLEWARE ///
  /////////////////////////////////////////////////////////////  

  // middleware nvoked before yukon preApi, which calls nodule.preProcessor
  appPreApi: preApi(app),
   
  // middleware invoked before yukon doApi, which makes all API calls in parallel and waits for all of them to return
  appDoApi: doApi(app),
  
  // middleware invoked before yukon postApi, which calls nodule.postProcessor
  appPostApi: postApi(app),
  
  // middleware invoked before yukon finish, which renders template or sends JSON
  appFinish: finish(app),


  /////////////////////////////////////////////////// 
  /// FUNCTIONS INVOKED PRE AND POST API BY YUKON ///
  ///////////////////////////////////////////////////  
  
  // invoked before every API call
  beforeApiCall: beforeApiCall,

  // invoked after every API call
  afterApiCall: afterApiCall,

  // invoked after every stub call
  afterStubCall: afterStubCall,


  //////////////////////////////////////////////////////////  
  /// CUSTOM NODULE PROPERTIES ON TOP OF YUKON FRAMEWORK ///
  ////////////////////////////////////////////////////////// 
  noduleDefaults: {
    suppressNav: false, // set true to skip global nav API call on HTML nodules
  },


  ///////////////////////////////////////////////////////  
  /// CUSTOM API PROPERTIES ON TOP OF YUKON FRAMEWORK ///
  ///////////////////////////////////////////////////////  
  apiDefaults: {
    handleError: null, // set true to have nodule handle error instead of calling next(error)
  }
};


function beforeApiCall(callArgs, req, res) {
  debug('beforeApiCall');

  var apiServer = callArgs.host ? 'http://' + callArgs.host : app.locals.apiServer;

  callArgs.path = apiServer + callArgs.path;
}

function afterApiCall(callArgs, req, res, next) {
  debug('afterApiCall');

  delete callArgs.params; // delete due to PCI concerns
  
  if (callArgs.timer) callArgs.timer.stop();
  
  var apiResponse = callArgs.apiResponse;
  if (apiResponse) {
    var msg = "RESPONSE FROM " 
            + ((apiResponse.req) ? apiResponse + apiResponse.req.path : 'Superagent response.req is null')
            + ": statusCode=" + apiResponse.statusCode;
    debug(msg);
    req.log.info({timer: Date.now() - callArgs.apiStartTime, step:'API', status:apiResponse.statusCode, 
                 apiArgs:callArgs}, msg);

    var error = true, errorHandledByComponent = false;
    if (!callArgs.apiError && apiResponse.body && (callArgs.handleError === true 
        || callArgs.validStatusCodes.indexOf(apiResponse.statusCode) > -1)) { 
      error = null;
      errorHandledByComponent = true;
      onApiSuccess(callArgs, req, res);
    }

    // do error logic if we see certain errors, even if handled by component
    if (error || (errorHandledByComponent && app.config.defaultValidStatusCodes.indexOf(apiResponse.statusCode) === -1 && apiResponse.body.errors)) {
      onApiError(callArgs, req, res);
    }
  
    if ((!error || errorHandledByComponent) && callArgs.callback) {
      error = null;
      callArgs.callback(req, res);
    }
  }
  setTimeout(function() { next(error); }, req.nodule.apiSleep); // simulates API taking a certain amount of time
}

function afterStubCall(callArgs, req, res, next) {
  debug('afterStubCall');
  onApiSuccess(callArgs, req, res);
  
  if (callArgs.callback) callArgs.callback(req, res);
  
  setTimeout(function() { next(); }, req.nodule.apiSleep); // simulates API call
}
