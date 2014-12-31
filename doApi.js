// calls all APIs in parallel (inlcuding those added by the app-level appDoApi middleware)

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var debug;

module.exports = function(app, config) {
  debug = config.debug('yukon->doApi');

  // called as route comes in, before it goes to API
  return function(req, res, next) {
    debug("called");

    // skip if nodule doesn't have any API calls
    if (req.nodule.skipApi) {
      next();
      return;
    }

    var apiCalls = req.nodule.apiCalls || [], apiArgs = req.nodule.apiArgs || [], nodule = req.nodule;
    processStubs(app, req);

    var apiParamsIsArray = false;
    if (typeof nodule.apiPath === "string") 
      nodule.apiPath = [nodule.apiPath];
    // need to identify when apiPath is an array and params are effectively an array (although still technically an object) of objects
    else if (nodule.apiPath && !_.isEmpty(nodule.apiParams) && _.keys(nodule.apiParams)[0].match(/\d+/))
      apiParamsIsArray = true;

    _.each(nodule.apiPath, function(apiPath, index) {

      apiCalls.unshift(req.nodule.callApi); // add apiCalls to front of apiCalls array in case app-level apiCalls have no apiArgs

      apiArgs.unshift({ 
        apiPath        : apiPath, 
        apiHost        : getValue(nodule.apiHost, index), 
        apiParams      : getValue(nodule.apiParams, index, apiParamsIsArray), 
        apiVerb        : getValue(nodule.apiVerb, index),
        apiBodyType    : getValue(nodule.apiBodyType, index),
        handleError    : getValue(nodule.handleError, index),
        timeout        : getValue(nodule.timeout, index),
        stubPath       : getValue(nodule.stubPath, index), 
        namespace      : "data" + (1*index+1) });
    });
  
    if (apiCalls.length > 0) {
      parallel(apiCalls, req, res, next, apiArgs);
    }
    else 
      next();
  };
};

// return correct value for property if it is an array, or return the same value for every API if the property is not an array
function getValue(property, index, forceArray) {
  if (property && (property instanceof Array || forceArray))
    return property[index];
  else 
    return property;
}

function processStubs(app, req) {
  if (req.nodule.forceStub) {

    var nodule = req.nodule;

    // set one stub to array to share stub finding logic with multiple stub scenario
    if (typeof nodule.stubName === "string") {
      nodule.stubName = [nodule.stubName];
    }
    // if there is no stub we need to create an array of the same length as apiPath - kind of awkward but it's just stub mode
    else if (!nodule.stubName) {
      // if apiPath is a string then look for one stub, if it's an array look for that many stubs, if there is no apiPath don't look for stubs.
      var arrayLength = (typeof nodule.apiPath === 'string') ? 1 : ((nodule.apiPath) ? nodule.apiPath.length : 0);
      nodule.stubName = new Array(arrayLength);
      // initialize array with strings
      for (var i=0; i<arrayLength; i++)
        nodule.stubName[i] = "";
    }

    // loop over all stubs
    nodule.stubPath = [];
    var stubPath, sharedPath;
    _.each(nodule.stubName, function(stubName, index) {
      stubName = (stubName) ? stubName : nodule.name; // "guess" the nodule name if no stubName is supplied
      stubPath = path.join(nodule.path, stubName+'.stub.json');
      if (nodule.sharedStubPath) 
        sharedPath = path.join(process.cwd(), nodule.sharedStubPath, stubName+'.stub.json'); // TODO - make config setting

      // look for stob in nodule folder, then shared folder, if no stub is found use API
      if (fs.existsSync(stubPath))
        nodule.stubPath.push(stubPath);
      else if (sharedPath && fs.existsSync(sharedPath))
        nodule.stubPath.push(sharedPath);
    });

    debug('nodule name = ' + nodule.name + ', stubPath = ' + nodule.stubPath);
  }
}

// grabs N number of middleware methods, calls next() when all have returned
// optional args array matches each element in the apiMiddlewares array
function parallel(apiMiddlewares, req, res, next, args) {
  debug('parallel started!! # calls:' + apiMiddlewares.length);
  var results = 0;
  var errorReceived = null;
  if (!args) args = [];

  apiMiddlewares.forEach(function(middleware, index){
    middleware(req, res, function(err){
      // if error send full request into error flow (errors are logged at API level)
      if (err && !errorReceived) { 
        errorReceived = err; 
        next(err);
      }

      results++;
      if (!errorReceived && results === apiMiddlewares.length) {
        debug('parallel done!!');
        next();
      }
    }, args[index]);
  });
}
