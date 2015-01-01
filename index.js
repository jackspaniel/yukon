var _ = require('lodash');

module.exports = function(app, config) {
  var yukonConfig = _.merge(defaultConfig, config);
  yukonConfig.debug = yukonConfig.customDebug || yukonConfig.yukonCustomDebug;

  var debug = yukonConfig.debug('yukon->index');
  debug('initializing');
  
  yukonConfig.noduleDefaults.middlewares = [
    config.appPreApi  || passThrough,
    require('./preApi')(app, yukonConfig), // preprocessing logic before APIs are called

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
  // called at the start of every api or stub call
  beforeApiCall: null,

  // called after every api call
  afterApiCall: null,

  // called after every stub call
  afterStubCall: null,

  // default debug function
  yukonCustomDebug: function(identifier) {   
    return function(msg) {
      if (defaultConfig.debugToConsole) console.log(identifier+': '+msg);
    };
  },

  noduleDefaults: {
    // Properties inherited from nodule.js (see nodule conf (TODO:link here) as these may get out of date):
    // route (REQUIRED) - needs to be defined in each nodule, and be unique
    // routeVerb - (default:get)
    // routeIndex - (default:0)
    // middlewares - array of middleware functions to be executed on each request, defined in yukon module init

    // NOTE: the params below call be mutated in the preProcessor using this.myParam notation
    //       they can also be mutated in the postProcessor if the API calls are not dependent on them (IE - templateName)

    // MAGIC ALERT: if template name is null, the framework looks for [nodule name].templateExt 
    //              first in the nodule folder, then in the shared template folder
    templateName: null,

    // the framework looks for templates with the template name + this extension
    templateExt: '.jade',

    // 'html', 'json' only current values - use this to force any nodule to behave like a json or html call regardless of naming conventions or directory conventions
    contentType: null,

    // use to manipulate query params or other business logic before api call(s)
    preProcessor: function(req, res) { },

    // use to process data returned from the API before calling template or sending back to client as JSON
    postProcessor: function(req, res) { },
    // NOTE: one important property you usually need to set in the postProcessor is res.renderData 
    //       this is the data sent to the jade template or back to the client as JSON
    // MAGIC ALERT: if you don't specify res.renderData the framework sets res.renderData = res.locals.data1

    // set this.error to an Error() instance to call next(error) inside the preProcessor or postProcessor
    error: null,

    // array of apiCalls to call in parallel
    // NOTE: global or semi-global calls like getProfile, getGlobalNav, etc. can be added to this array in the appDoApi middleware
    apiCalls: [],
  },

  /// API CALL PROPERTIES ////////////////////////////////////////////////////////////////
  /// NOTE: there can be multiple api calls per nodule, all called in parallel
  apiDefaults: {
    // path to server, can be used to over-ride default 
    host: null, 

    // MAGIC ALERT: if api path ends with a slash(/), the framework automatically tries to append req.params.id from the express :id wildcard 
    //              as this is a very common REST paradigm
    path: null,

    // params to send to API server
    // if verb is 'post', this can be a deep json object (apiBodyType=json) or a shallow object of name value pairs (apiBodyType=form)
    params: {},

    // valid values: get, post, put, del (express uses 'del' since delete is a reserved word)
    verb: 'get',

    // valid values: json, form (use 'form' for a standard post submit with name/value pairs - everything wants json body)
    bodyType: 'json',

    // (numeric) - max API return time in ms
    timeout: null,

    // set true to force api to use stub (IE - if API isn't ready yet)
    useStub: false,

    // can contain path or just name if in same folder
    // MAGIC ALERT: if not specified, app looks for [nodule name].stub.json in nodule folder
    stubPath: null,
  },
};
