# yukon API framework

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

yukon is a component-based framework built on top of node/express - which makes 0-n asynchronous REST API calls in parallel to provide back-end data for each express request. It extends the [nodulejs component framework](https://github.com/jackspaniel/nodulejs). 

A really simple yukon component looks like this:
```js
module.exports = function(app) {
  return {
  
    route: '/home', 
    
    templateName: 'homePage.jade',

    apiCalls: [
      {path: '/api/cms/home'},
      {path: '/api/data/homedata'}
    ],
    
    preProcessor: function(req, res) {
      // pre-API(s) business logic goes here
    },
    
    postProcessor: function(req, res) {
      // post-API(s) business logic goes here
    }
  };
};
```
## Installation
```
$ npm install yukon
```

## Usage
```
require('yukon')(app, config); 
```
+ __app__ = express instance.
+ __config__ = any custom properties you want to add or defaults you want to override. See the [demoApp](https://github.com/jackspaniel/yukon/blob/master/demo/demoApp.js) for an example of a working yukon app. See the Config section below for more details. 

## What is a yukon nodule? 
A *__nodule__* is a self-discovering, self-initializing web component, which propagates throughout the express middleware chain as req.nodule. A *__yukon nodule__* extends the base nodule behavior to include REST API data gathering, stub-handling and template-rendering. 

*Nodulejs was split off from yukon to separate out the core self-discovery and initialization features, as these potentially could be used as a building block for a wide variety of frameworks.*

A nodule is analogous to a JSP or PHP page in those worlds. Unlike PHP/JSP behavior however, a nodule's route is declared and not tied by default to the filename or folder structure. So you are free to re-organize nodules without upsetting urls. More importantly, because nodules are self-discovering, there are no onerous config files to maintain (IE - Spring). This system allows a much more scalable architecture on large sites--as there are no config or other shared files which grow to enormous sizes as the site grows, and nodules can be re-organized with zero impact.

## Motivation 
From a __feature-development point of view__, we wanted to give developers the flexibility of [component-based architecture](http://en.wikipedia.org/wiki/Component-based_software_engineering) as much as possible, but still keep system-wide control over the middleware chain. On a small site with a small development team the latter might not be an issue. But on a large site with devs scattered all over the globe, some kind of middleware sandbox was a necessity. 

Our feature devs spend 80-90% of their effort in jade templates or on the client side. For them, node components are often just a pass-through to the API(s), with some business logic applied to the request on the way in, and api data on the way out. Ideally they should have to learn the as little as possible of the vagaries/plumbing/whatever-your-favorite-metaphor-for-framework-stuff of node. Creating a new node component should be as easy for them as creating a new JSP - but again, without the framework losing control of the middleware chain.

From a __framework-development point of view__, we knew that as requirements evolved, we would constantly need to add default properties to each component, while hopefully causing as little disruption as possible to existing components. This is easily accomplished by adding a default property to the base config, then specifying the property only in the nodules that need the new property.

We also knew we'd need to add slices of business logic globally or semi-globally at any point in the request chain. By keeping control of the middleware chain we are able to do this with ease. 

This diagram might make the concept a little more clear:

![](http://i.imgur.com/eXExJi8.gif)

## Config

Yukon config is broken into 3 sections:

1. Nodule-specific properties
2. API-specific properties
3. App-defined middleware functions and global settings

*Note: You may occasionally see "MAGIC ALERT" below. This is for the handful of times where the framework does some convenience method that isn't immediately obvious, but comes up so much we felt the code saving was worth the loss in conceptual clarity.*

### Nodule-specific properties (config.noduleDefaults)

Yukon inherits the 4 core [nodulejs](https://github.com/jackspaniel/nodulejs) defaults:

1. __route__: <span style="color:grey">(REQUIRED)</span> one or more express routes - can be a string, RegExp, or array of either
2. __routeVerb__: <span style="color:grey">(OPTIONAL, default=get)</span> get, post, put, del
3. __routeIndex__: <span style="color:grey">(OPTIONAL, default=0)</span> use to match express routes before or after others, can be negative, like z-index
4. __middlewares__:  <span style="color:grey">(OPTIONAL)</span> define this in your nodule to override the entire yukon request chain. See [404.js from the demoApp](https://github.com/jackspaniel/yukon/blob/master/demo/404.js) for example.

Yukon also adds the following optional nodule properties:

1. __templateName:__ MAGIC ALERT: if null the framework looks for a template in the same folder and of the same name as the nodule filename + templateExt. So if you have myPage.jade in the same folder as myPage.js, there is no need to specify template name.
2. __templateExt:__ default template extension
3. __contentType:__ 'html' and 'json' are the only current values
4. __preProcessor:__ use this function to manipulate query params or other business logic before api call
5. __postProcessor__: use this function to process data returned from the API before calling template or sending back to client as JSON
6. __error:__ set to a string or an Error() instance to get the framework to call next(error)
7. __apiCalls:__ array of API calls to made in parallel for this nodule, see the section below for details what constitutes an API call. 
<br>NOTE: global or semi-global calls like getProfile, getGlobalNav, etc. can be added to this array in the appPreApi middleware.

### API-specific properties (config.apiDefaults)

Yukon defines the following properties for each API call. It is important to understand that these exist in a one-to-many relationship with nodules. 

1. __path:__ path to API (not including server). 
<br>MAGIC ALERT: if the API path ends with a slash(/), the framework automatically tries to append req.params.id from the express :id wildcard. For us at least this is a very common REST paradigm.
2. __params:__ params to send to API server. If the api verb is 'post', this can be a deep json object (bodyType=json) or a shallow object of name value pairs (bodyType=form).
3. __verb:__ get, post, put, del
4. __bodyType:__ valid values: json, form
5. __host:__ path to the API server, can be set in app-defined middleware or overridden at the nodule level.
6. __customHeaders:__ custom headers to sent with API call
7. __timeout:__ (numeric) - max API return time in ms
8. __useStub:__ set true to force framework to use stub instead of API
9. __stubPath:__ can contain path or just name if in same folder
<br>MAGIC ALERT: if not specified, app looks for [nodule name].stub.json in nodule folder

### App-defined middlware

An app can create and use 4 optional express middleware functions, which splice in between the built-in yukon middleware (see [yukon.js](https://github.com/jackspaniel/yukon/blob/master/yukon.js) for more detail):

1. __appStart:__ called at start of middleware, before nodule.preProcessor
2. __appPreApi:__ called after nodule.preProcessor, before API call(s)
3. __appPostApi:__ called after API call(s), before nodule.postProcessor
4. __appFinish:__ called after nodule.postProcessor, before res.send() or res.

An app can also create 2 global functions, which are executed before and after every API call. It's important to understand that there can be several API calls per express request. So these functions are not in the standard middleware chain, although the api callback does make use of the middleware paradigm.

1. __apiCallBefore:__ a synchronous function executed before of every api call. Do any common API pre-processing here. 
2. __apiCallback:__ an asynchronous function executed after every api call, must execute next() if defined. Do error handling and other common post-API processing here. 
 
### Global properties

There are also 3 global config properties inherited from [nodulejs](https://github.com/jackspaniel/nodulejs):

1. __dirs__: <span color="grey">(OPTIONAL, default='/nodules')</span> *path(s) to look for your nodules, exclude property can be full or partal match* <br>__example:__ [{ path: '/app', exclude: ['demoApp.js', '.test.js', '/shared/'] }, { path: '/lib/nodules', exclude: ['.test.js'] }]
2. __debugToConsole__: <span style="color:grey">(OPTIONAL, default=false)</span> *set to true to see nodulejs debug output in the console* 
3. __customDebug__: <span style="color:grey">(OPTIONAL)</span> *custom debug function* <br>__example:__ function(identifier) { return function(msg){... your debug function here ...} }

### To Run Node Tests
```
Download yukon - https://github.com/jackspaniel/yukon/archive/master.zip
$ npm install
$ make test 
```
## To Do
1. Stop populating res.locals and res.renderData with API response data. All API response data and errors should be tacked on to the req.nodules.callArgs[namespace] object. (Maybe rename callArgs to something a little less arg-y?) An app can add these convenience shortcuts if desired.
2. Reconside stub behavior. Should all stubs move to apiSim behavior? What about brand new nodules where nothing is known about the API yet?
2. Get demoApp working as standalone.
3. Write more detailed unit tests?
4. Hook up Travis CI and code coverage.

## Features for future consideration
+ __Other forms of async data gathering.__ Currently yukon only knows how to make REST API calls. But it woudn't take much work to extend this behavior to any sort of asynchronous data store - such as a Mongo DB or Redis cache.
+ __Sequential API calls.__ Currently yukon makes all API calls in parallel. We've been fortunate in that we haven't needed dependent API calls yet.
+ __API error handling.__ It seems that there can be a huge variation in error behavior, and even in what constitutes an API error (status code-based?), from web-app to web-app. So for now I've punted on advanced API error handling, and let the app deal with it in the API callback. But if something like a standard is more or less agreed-upon, I will be happy to add flexible error handling.

## Examples:

#### HTML response
([homePage.js](https://github.com/jackspaniel/yukon/blob/master/demo/homePage/homePage.js) from the demoApp)
```js
module.exports = function(app) {
  return {
  
    route: ['/', '/home', '/special'], // multiple routes

    apiCalls: [
      {path: '/api/cms/home'},
      {path: '/api/data/homeslices'}
    ],
    
    // pre-API(s) business logic
    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      if (req.path.indexOf('special') > -1) {
        this.apiCalls[1].params = {isSpecial: true}; // setting api params at request-time
        this.templateName = 'altHomePage.jade'; // using alternate template
      }
    },
    
    // post-API(s) business logic
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      var clientMsg = res.locals.data2.specialMsg || res.locals.data2.msg;

      res.renderData = {
        globalNav: res.locals.globalNav,
        cmsData: res.locals.data1,
        myData: res.locals.data2,
        clientMsg: clientMsg
      };
    }
  };
};
```

#### JSON response
([getData.js](https://github.com/jackspaniel/yukon/blob/master/demo/json/getData.js) from the demoApp)
```js
module.exports = function(app) {
  return {
    
    route : '/json/getData/:id',       

    apiCalls: [
      {path: '/api/getdata/'}, // :id is tacked on by the framework automatically
    ],

    preProcessor: function(req, res) {
      this.debug('preProcessor called');

      this.apiCalls[0].params = {myParam: req.query.myParam};
   },
    
    postProcessor: function(req, res) {
      this.debug('postProcessor called');

       res.renderData = {
         systemMsg: res.locals.data1.systemMsg,
         data: res.locals.data1
      };
    }
  };
};
```

#### Form submit
([submitForm.js](https://github.com/jackspaniel/yukon/blob/master/demo/json/submitForm.js) from the demoApp)
```js
var _ = require('lodash');

module.exports = function(app) {
  return {
 
    route : '/json/submitForm',  

    routeVerb: 'post', // default = get       
    
    apiCalls: [{
      path: '/api/submitform',
      verb: 'post', // post to API
      bodyType: 'form', // default = 'json'
    }],

    preProcessor: function(req, res) {
      this.debug('preProcessor called');
      
      if (!_.isEmpty(req.body)) {
        this.apiCalls[0].bodyType = 'json';
        this.apiCalls[0].params = req.body; // JSON body
      }
      else {
        this.apiCalls[0].params = req.query; // url-encoded
      }
    },

    postProcessor: function(req, res) {
      this.debug('postProcessor called');

      res.renderData = {
        response: res.locals.data1
      };
    }
  };
};
```

#### App-defined middleware
(from [demoApp.js](https://github.com/jackspaniel/yukon/blob/master/demo/demoApp.js))
```js
function demoStart(req, res, next) {
  debug("demoStart called");

  res.locals.pretty = true; // jade pretty setting - turn off at the component level if necessary

  // example of setting nodule property globally
  if (req.nodule.contentType !== 'html' && req.path.indexOf('/json/') === 0)
    req.nodule.contentType = 'json'; 

  // example of app-level logic - simple device detection (used throughout demoApp)
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
```

#### Global API callback and error handling
(from [demoApp.js](https://github.com/jackspaniel/yukon/blob/master/demo/demoApp.js))
```js
function demoApiCallback(callArgs, req, res, next) {
  
  // custom error handling
  if (callArgs.apiError && !callArgs.handleError) {
    debug(callArgs.apiError.stack || callArgs.apiError);
    next(new Error('API failed for '+callArgs.path +': '+callArgs.apiError));
  }
  else {
    var msg = "RESPONSE FROM "+callArgs.apiResponse.req.path+": statusCode=" + callArgs.apiResponse.statusCode;
    debug(msg); 
    
    // example of app-level logic on every api response (remember there can be multiple API calls per request)
    res.locals[callArgs.namespace].systemMsg = msg;

    // used by kitchen sink to test if API custom headers are being set
    if (callArgs.apiResponse.req._headers)
      res.locals[callArgs.namespace].customHeaders = callArgs.apiResponse.req._headers;  

    next();
  }
}
```

For more examples see the [Kitchen Sink](https://github.com/jackspaniel/yukon/blob/master/demo/kitchenSink/kitchenSink.js) and the rest of the [Demo App](https://github.com/jackspaniel/yukon/blob/master/demo/)

## License
### MIT

[npm-image]: https://img.shields.io/npm/v/yukon.svg?style=flat
[npm-url]: https://www.npmjs.com/package/yukon
[downloads-image]: https://img.shields.io/npm/dm/yukon.svg?style=flat
[downloads-url]: https://npmjs.org/package/yukon
