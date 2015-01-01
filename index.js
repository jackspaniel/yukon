var _ = require('lodash');

module.exports = function(app, config) {
  var yukonConfig = _.merge(defaultConfig, config);
  yukonConfig.debug = yukonConfig.customDebug || yukonConfig.yukonCustomDebug;

  var debug = yukonConfig.debug('yukon->index');
  debug('initializing');
  
  var api = require('./api.js')(app, yukonConfig);

  yukonConfig.noduleDefaults.middlewares = [
    config.appPreApi  || passThrough,
    require('./preApi')(app, yukonConfig, api), // preprocessing logic before APIs are called

    config.appDoApi   || passThrough,
    require('./doApi')(app, yukonConfig), // handles all API calls in parallel

    config.appPostApi || passThrough,
    require('./postApi')(app, yukonConfig), // common post-processing logic after all APIs return

    config.appFinish  || passThrough,
    require('./finish')(app, yukonConfig), // finish with json or html
  ];
  
  // nodulejs finds and loads nodules based on config below, registers routes with express based on nodule route and other properties
  require('nodulejs')(app, yukonConfig); 
};

function passThrough(req, res, next) {
  next();
}

var defaultConfig =  {
  // called at the start of every api call if defined
  beforeApiCall: null,

  // called after every api call if defined
  afterApiCall: null,

  // called after every stub call if defined
  afterStubCall: null,

  // directory to start in for templateNames with a directory in them
  templateRoot: 'nodules',

  // alternate place to look for stubs than the nodule dir
  sharedStubPath: null,

  // default debug function
  yukonCustomDebug: function(identifier) {   
    return function(msg) {
      if (defaultConfig.debugToConsole) console.log(identifier+': '+msg);
    };
  },

  noduleDefaults: {
    // array of middleware functions to be executed on each request, set in yukon init method
    middlewares: null, 

    // use to skip API call(s) altogether
    skipApi: false,

    // array of optional functions to be called with the apis specified in the nodule (IE - global or semi-global calls like getProfile, getGlobalNav)
    // these can be conditional per nodule/request if set in the appDoApi middleware
    apiCalls: [],

    // arguments (if needed) to go with the apiCalls above
    apiAgs: [],

    // Properties inherited from nodule.js (see nodule conf (TODO:link here) as these may get out of date):
    // middlewares (REQUIRED) - array of (or function which returns array of) middleware functions which will be called in order for each nodule on each express request
    // route (REQUIRED) - needs to be defined in each nodule, and be unique
    // routeVerb - (default:get)
    // routeIndex - (default:0)

    // NOTE: the params below call be mutated in the preProcessor using this.myParam notation
    //       they can also be mutated in the postProcessor if the API calls are not dependent on them (IE - templateName)

    //  app looks for [nodule name].[ templateExt ] if not specified and request is not JSON
    templateName: null,

    // app looks for templates with the same filename + this extension
    templateExt: '.jade',

    // can be array or string - path to API server, can be used to over-ride default 
    apiHost: null, 

    // path to API - note: if path ends with a / framework automatically appends req.params.id
    // Notes on multiple APIs per component:
    //    1. Set the apiPath property to an array instead of a string.
    //    2. The app places each API call in res.locals.data1, res.locals.data2, etc. 
    //    3. If any of the APIs needs params, make sure you put them in the correct slot. IE - apiParams[1] = {indludecta:'true'};
    //    4. If an array of stubNames is created - those will be used in place of the corresponding APIs when in stub mode.
    //    6. As before, to use the same stub for each call just leave stubName blank (looks for standard name) or specify a custom string.
    //    7. As always you can set any of the properties above dynamically inside your preProcessor using the this.[propertyName] nomenclature.
    apiPath: null,

    // params to send to API server
    // If apiVerb is 'post', this can be a deep json object (apiBodyType=json) or a shallow object of name value pairs (apiBodyType=form)
    // If using multiple apiPaths, make sure you put the apiParams in the correct slot. IE - apiParams[1] = {indludecta:'true'};
    apiParams: {},

    // valid values: get, post, put, del - or array of these if different values are needed for different calls (uses 'del' since delete is a reserved word)
    apiVerb: 'get',

    // valid values: json, form  - or array of these if different values are needed for different calls (use 'form' for a standard post submit with name/value pairs - everything else is json body)
    apiBodyType: 'json',

    // set to > 0 (milliseconds) force stub calls to simualate a longer api call - works for API or Stubs
    // WARNING: don't forget to turn this off in production mode!
    apiSleep: 0,

    // (numeric) - max API return time in ms, needs to be array if more than one API is called, set other values to null to use default - IE - [null,20000,null]
    timeout: null,

    // if not specified, app looks for [nodule name].stub.json - looks for stubName first in nodule folder, then in app/shared/stubs
    // Note: can be array to use stubs for multiple api calls
    stubName: null,

    // set true to force api to use stub (IE - if API isn't ready yet)
    forceStub: false,

    // 'html', 'json' only current values - use this to force any nodule to behave like a json or html call regardless of naming conventions or directory conventions
    contentType: null,

    // set this to an Error() instance to "throw" an error from your nodule - see channel.js for example
    error: null,

    // use to manipulate query params or other business logic before api call(s)
    preProcessor: function(req, res) { },

    // use to process data returned from the API before calling template or sending back to client as JSON
    postProcessor: function(req, res) { },
    // NOTE: one important property you can set in this function is res.renderData - this is the data sent to the jade template or back to the client as JSON
    // if you don't specify res.renderData the app uses res.locals.data1
  }    
};
