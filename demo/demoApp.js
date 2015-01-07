// simplistic example application for yukon API framework

var _ = require('lodash');
var yukon = require('..');
var debug;

module.exports = function(app, appConfig) {  
  var mergedConfig = _.merge(config, appConfig || {});
  
  // initializing these here because they need a reference to app
  mergedConfig.appPreApi = demoPreApi(app);
  mergedConfig.apiCallBefore = demoApiCallBefore(app);

  yukon(app, mergedConfig); 

  app.use(handleErrors);

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
  appStart: demoStart,
   
  // middleware invoked before yukon doApi, which makes all API calls in parallel and waits for all of them to return
  appPreApi: null, // set in init since it needs app
  
  // middleware invoked before yukon postApi, which calls nodule.postProcessor
  appPostApi: demoPostApi,
  
  // middleware invoked before yukon finish, which renders template or sends JSON
  appFinish: demoFinish,


  /////////////////////////////////////////////////// 
  /// FUNCTIONS INVOKED PRE AND POST API BY YUKON ///
  ///////////////////////////////////////////////////  
  
  // invoked before every API call
  apiCallBefore: null, // set in init since it needs app

  // invoked after every API call - success or error
  apiCallback: demoApiCallback,


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

function demoStart(req, res, next) {
  debug("demoStart called");

  res.locals.pretty = true; // jade pretty setting - turn off at the component level if necessary

  // example of setting nodule property globally
  if (req.nodule.contentType !== 'html' && req.path.indexOf('/json/') === 0)
    req.nodule.contentType = 'json'; 

  // example of app-level logic - simple device detection (used throughout middleware examples)
  if (req.headers['user-agent'].match(/android/i))
    req.deviceType = 'Android';
  else if (req.headers['user-agent'].match(/iphone/i))
    req.deviceType = 'iPhone';
  else if (req.headers['user-agent'].match(/ipad/i))
    req.deviceType = 'iPad';
  else 
    req.deviceType = 'web';

  next();
}

function demoPreApi(app) {
  return function(req, res, next) {
    debug("demoPreApi called");

    // example of how to *use stub/set nodule property* based on individual nodule or global config setting
    req.nodule.useStub = req.nodule.useStub || app.locals.useStubs;

    // example of adding global api call at app-level
    if (req.nodule.contentType !== 'json' && !req.nodule.suppressNav)      
      req.nodule.apiCalls.push({path:'/api/globalnav',  namespace:'globalNav'});
    
    next();
  };
}

function demoPostApi(req, res, next) {
  debug("demoPostApi called");

  // example of adding functionality globally after the API but before the nodule post processor is called
  if (res.yukon.globalNav)
    res.yukon.globalNav.deviceType = req.deviceType;

  next();
} 

function demoFinish(req, res, next) {
  debug("demoFinish called");

  // example of adding functionality before the framework calls res.render or res.send
  if (req.nodule.contentType !== 'json')
    res.yukon.renderData.deviceType = req.deviceType;
  else
    res.yukon.renderData.clientData = {deviceType: req.deviceType};

  next();
}

function demoApiCallBefore(app) {
  return function(callArgs, req, res) {
    debug('callling API - ' + callArgs.verb + ': ' + callArgs.path);

    // example of using global property if not specified
    callArgs.host = callArgs.host ? 'http://' + callArgs.host : req.headers.host; // using run-time host for API sims

    // example of custom API headers and app-specific behavior before calling API
    callArgs.customHeaders.push({ name: 'x-device-type', value: req.deviceType});
  };
}

function demoApiCallback(callArgs, req, res, next) {
  if (callArgs.apiError && !callArgs.handleError) {
    debug(callArgs.apiError.stack || callArgs.apiError);
    next(new Error('API failed for '+callArgs.path +': '+callArgs.apiError));
  }
  else {
    var msg = "RESPONSE FROM "+callArgs.apiResponse.req.path+": statusCode=" + callArgs.apiResponse.statusCode;
    debug(msg);
    
    // example of app-level logic on every api response (remember there can be multiple API calls per request)
    res.yukon[callArgs.namespace].systemMsg = msg;

    // used by kitchen sink to test if API custom headers are being set
    if (callArgs.apiResponse.req._headers)
      res.yukon[callArgs.namespace].customHeaders = callArgs.apiResponse.req._headers;  

    next();
  }
}

function handleErrors(err, req, res, next) {
  debug('handleErrors called');
  debug(err.stack || err.toString());
  res.status(500).send('<h1>500 Server Error</h1><h3><pre>' + (err.stack || err) + '</pre></h3>');
}

