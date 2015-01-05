// FEATURES TESTED:

// modifying API path at request time

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Specific Route JSON Call (getSpecificData.js)', function() {
    
    it('should add ID to API path at request time', function(done) {
      request(app)
        .get('/json/getData/specialId1')
        .end(function(err, res) {
          expect(res.text).toContain('RESPONSE FROM /api/getdata/special/specialId1?myParam=specialsauce', 'res.text='+res.text);
          done();
        });
    });

  });
};