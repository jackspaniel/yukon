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

  // invoked after every API call - success or error
  afterApiCall: afterApiCall,


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
  debug('callling API - ' + callArgs.verb + ': ' + callArgs.path);
  // example of app-specific behavior before calling API
  callArgs.customHeaders = [
    { name: 'x-device-type', value: req.deviceType},
  ];
}

function afterApiCall(callArgs, req, res, next) {
  if (callArgs.apiError && !callArgs.errorHandledByComponent) {
    debug(callArgs.apiError.stack || callArgs.apiError);
    next(new Error('API failed for '+callArgs.path +': '+callArgs.apiError));
  }
  else {
    debug("RESPONSE FROM "+apiResponse.req.path+": statusCode=" + apiResponse.statusCode);
    
    next();
  }
}

function afterStubCall(callArgs, req, res, next) {
  debug('afterStubCall');
  next();
}
