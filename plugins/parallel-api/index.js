// plugins return 2 properties:
// 1. A standard express middlware function used to gather data
// 2. A config object which is merged with the yukon config properties

var _ = require('lodash');

module.exports = function(app, config) {
  var debug = config.customDebug('yukon->parallel-api->index');

  // merge app config over plugin config
  // since plugin is a peer to yukon - the merge order with yukon doesn't matter
  // but any properties set in the app config should always override both
  var mergedConfig = _.merge(defaultConfig, config);

  var middleware = require('./parallelApi')(app, mergedConfig);

  return {
    middleware: middleware,
    mergedConfig: mergedConfig, // return merged config
  };
};

// config can contain any properties (and default values) that you want to be added to the base nodules
// also any new properties you would like access to via the yukon config object
var defaultConfig =  {
  
  // properties use by this plugin to add to yukon nodule defaults
  // Note: plugin nodule properties should never override any base config properties, only add new
  noduleDefaults: {
    // array of apiCalls to call in parallel
    // NOTE: global or semi-global calls like getProfile, getGlobalNav, etc. can be added to this array in the app-defined preData middleware
    apiCalls: [],
  },


  // App-defined functions invoked by this plugin

  // (OPTIONAL) synchronous function called at the start of every api call
  apiCallBefore: function(callArgs, req, res) { },

  // (OPTIONAL) asynchronous function called after every api call
  // NOTE: must execute next() if defined
  apiCallback: function(callArgs, req, res, next) { next(callArgs.apiError); },


  // new config properties used only by this plugin 
  
  // there can be multiple api calls per nodule, all called in parallel
  apiDefaults: {
    // path to server, can be used to over-ride default 
    host: null, 

    // MAGIC ALERT: if api path ends with a slash(/), the framework automatically tries to append req.params.id from the express :id wildcard 
    //              as this is a very common REST paradigm
    path: null,

    // params to send to API server
    // if verb is 'post', this can be a deep json object (bodyType=json) or a shallow object of name value pairs (bodyType=form)
    params: {},

    // valid values: get, post, put, del (express uses 'del' since delete is a reserved word)
    verb: 'get',

    // valid values: json, form
    bodyType: 'json',

    // custom headers to sent to API
    customHeaders: [],

    // (numeric) - max API return time in ms
    timeout: null,

    // set true to force api to use stub (IE - if API isn't ready yet)
    useStub: false,

    // can contain path or just name if in same folder
    // MAGIC ALERT: if not specified, app looks for [nodule name].stub.json in nodule folder
    stubPath: null,
  },
};
