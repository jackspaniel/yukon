# yukon API framework

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

yukon is a component-based framework built on top of node/express - which calls 0-N APIs in parallel - and extends the [nodulejs framework](https://github.com/jackspaniel/nodulejs). "nodules" are self-discovering, self-initializing web components which propagate throughout the express middleware chain as __req.nodule__.

## Installation
```
$ npm install yukon
```

## Usage
```
require('yukon')(app, config); 
```

__app__ = express instance
<br>__config__ = any custom properties you want to add or defaults you want to override, see the [demoApp](https://github.com/jackspaniel/yukon/blob/master/demo/demoApp.js)

There are 3 global config properties inherited from nodulejs:

1. __dirs__: <font color="grey">(OPTIONAL, default='/nodules')</font> *path(s) to look for your nodules, exclude property can be full or partal match* <br>__example:__ [{ path: '/app', exclude: ['demoApp.js', '.test.js', '/shared/'] }, { path: '/lib/nodules', exclude: ['.test.js'] }]
2. __debugToConsole__: <span style="color:grey">(OPTIONAL, default=false)</span> *set to true to see nodulejs debug output in the console* 
3. __customDebug__: <span style="color:grey">(OPTIONAL)</span> *custom debug function* <br>__example:__ function(identifier) { return function(msg){... your debug function here ...} }

# Features for future consideration
+ __Sequential API calls.__ Currently yukon makes all API calls in parallel. 
+ __Error handling.__ It seems that there can be a huge variation in error behavior and what constitutes an error (status code-based?) from web-app to web-app. So for now I've punted on advanced error handling, and let the app deal with it in the api callback. But if something like a standard is more or less agreed-upon, I will be more than happy to add flexible error handling.

# License
MIT

[npm-image]: https://img.shields.io/npm/v/nodulejs.svg?style=flat
[npm-url]: https://www.npmjs.com/package/nodulejs
[downloads-image]: https://img.shields.io/npm/dm/nodulejs.svg?style=flat
[downloads-url]: https://npmjs.org/package/ndoulejs
