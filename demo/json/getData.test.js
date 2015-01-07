// FEATURES TESTED:

// setting global rule by app-defined middleware (anything in /json folder gets contentType = 'json')
// setting global property (systemMsg) on res.yukon.renderData via middleware

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('JSON Call (getData.js)', function() {
    
    it('should automatically get content type json due to rule in app-defined middleware', function(done) {
      request(app)
        .get('/json/getData/someId')
        .end(function(err, res) {
          expect(res.text).toMatch(/^\{/, 'res.text='+res.text);
          done();
        });
    });

    it('should have systemMsg added by app-definied middleware', function(done) {
      request(app)
        .get('/json/getData/someId')
        .end(function(err, res) {
          expect(res.text).toContain('"systemMsg":"RESPONSE FROM /api/getdata/someId', 'res.text='+res.text);
          done();
        });
    });

  });
};