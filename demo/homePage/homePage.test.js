// FEATURES TESTED:

// standard flow (home page loads with "magic" template based on filename)
// nodule pre-API business logic function (changing template in preProcessor)
// nodule post-API business logic function (changing client msg in postProcessor)
// doApi middleware function - global API call should be added by app (res.yukon.renderDataglobalNav)
// preData and postData middlware functions - res.yukon.renderDataglobalNav.deviceType should be added

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Home Page', function() {
    
    it('GET /home should load happy path and "guess" template based on filename', function(done) {
      request(app)
        .get('/home')
        .end(function(err, res) {
          expect(res.text).toContain('<h1>HOME PAGE', 'res.text='+res.text);
          done();
        });
    });

    it('GET /special should use alternate page template and alternate client message', function(done) {
      request(app)
        .get('/special')
        .end(function(err, res){
          expect(res.text).toContain('<h1>ALTERNATE HOME PAGE', 'res.text='+res.text);
          expect(res.text).toContain("alert('SPECIAL home page data API success!", 'res.text='+res.text);
          done();
        });
    });

    // that app-level tests could live in demoApp.test.js, but there's only 2 of them total so meh
    it('demoApp should be able to add global API middleware', function(done) {
      request(app)
        .get('/')
        .end(function(err, res) {
          expect(res.text).toContain('global nav = {"msg":"global nav success!', 'res.text='+res.text);
          expect(res.text).toContain('"deviceType":"web"', 'res.text='+res.text);
          done();
        });
    });

    it('demoApp should be able to propagate custom request property via app-defined middleware', function(done) {
      request(app)
        .get('/')
        .set('user-agent', 'iphone')
        .end(function(err, res) {
          expect(res.text).toContain('"deviceType":"iPhone"', 'res.text='+res.text);
          done();
        });
    });

  });
};