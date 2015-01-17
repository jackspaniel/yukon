// FEATURES TESTED:

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Simple Test (console output is expected)', function() {
    
    it('GET /home should load happy path and "guess" template based on filename', function(done) {
      request(app)
        .get('/alt')
        .end(function(err, res) {
          expect(res.text).toContain('<h1>SIMPLE PAGE', 'res.text='+res.text);
          done();
        });
    });
  });
};