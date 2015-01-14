var _ = require('lodash');
var async = require('async');

module.exports = function (app, config) {

  return mysqlQuery;

  function mysqlQuery (req, res, next) {
    var debug = config.customDebug('yukon->mysql->mysqlQuery');

    if (req.nodule.mysqlQueries.length === 0) {
      debug('No MYSQL queries');
      next();
      return;
    }

    config.mysql.connect(function (err, connection) {
      if (err) {
        debug('MYSQL connection error: ', err);
        next(err);
        return;
      }
      debug('MYSQL connection open');

      var steps = [];

      _.each(req.nodule.mysqlQueries, function (q, index) {
        debug('MYSQL query #' + index + ' ' + q.query);
        debug('MYSQL params #' + index + ' ' + q.params);
        steps.push(function (cb) {
          connection.query(q.query, q.params, function (err, results) {
            cb(err, results);
          });
        });
      });

      async[req.nodule.mysqlAsync](steps, function (err, results) {
        connection.release();
        debug('MYSQL query finished');
        if (err) {
          debug('MYSQL results error');
          next(err);
        } else {
          debug('MYSQL results success: ' + (results.length || results));
          res.locals.mysqlData = results;
          next();
        }
      });

    });
  }
};


