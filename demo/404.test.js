// BASIC PAGE EXAMPLE

// custom middleware array (bypasses standard app/yukon middleware chain)

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('404 Error Page', function() {
    
    it('should respond to any non-matched route, using custom one-off middleware', function(done) {
      request(app)
        .get('/mistermxyzptlk')
        .end(function(err, res) {
          expect(res.text).toContain('404 error!', 'res.text='+res.text);
          done();
        });
    });

  });
};