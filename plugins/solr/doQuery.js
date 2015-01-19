// NOTE: this is just an illustrative first pass
// it contains a great deal of app-specific logic that should be handled in the 

var solr = global.requireFromRoot('framework/solr');

var _ = require('lodash');
var async = require('async');

module.exports = function (app, config) {

  function solrQuery (req, res, next) {
    var debug = config.customDebug('yukon->solr->solrQuery');

    if (!req.nodule.solrQuery) {
      debug('No SOLR query');
      next();
      return;
    }

    // this block should move to your app-defined middleware - queryCallBefore
    // var query;
    // if (_.isObject(req.nodule.solrQuery)) {
    //   var objectDefaults = {
    //     activityId: req.authData.activityId,
    //     clientId: req.authData.clientId
    //   };
    //   query = _.merge({}, objectDefaults, req.nodule.solrQuery);
    // } else if (_.isString(req.nodule.solrQuery)) {
    //   query = 'activityId:'+req.authData.activityId+
    //                ' AND clientId:'+req.authData.clientId+ 
    //                ' AND ' + req.nodule.solrQuery;
    // } else {
    //   var err = new Error('Invalid Solr Query');
    //   err.status = 400;
    //   next(err);
    //   return;
    // }

    // if (!req.query.from) {
    //   req.query.from = 0;
    // }
    // if (!req.query.take) {
    //   req.query.take = 1;
    // }

    var sQ = solr.client.createQuery()
                                      .q(query)
                                      .sort({dateAsLong: 'desc'}) // these should move the callBefore function
                                      .fl(req.nodule.solrFieldList) // these should move the callBefore function
                                      .start(req.query.from) // these should move the callBefore function
                                      .rows(req.query.take); // these should move the callBefore function

    debug('SOLR query start: ', sQ);
    solr.client.search(sQ, function (err, obj) {
      debug('SOLR query finish');
      if (err) {
        debug('SOLR results error');
        next(err);
      } else {
        debug('SOLR results success: ' + (obj.response.docs.length || obj.response.docs));
        res.locals.solrData = obj.response.docs;
        res.locals.solrDataLength = _.isArray(obj.response.docs) ? obj.response.docs.length : 0;
        next();
      }
    });
  }
};