// FEATURES TESTED:

// setting route verb 
// setting API verb
// setting api body request type ('form'=url-encoded, 'json'=json body)
// send JSON body form submit from request to API 

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Form Submit JSON Call (submitForm.js)', function() {
    
    it('should not respond to get request', function(done) {
      request(app)
        .get('/json/submitForm')
        .end(function(err, res) {
          expect(res.text).toContain('404 error!', 'res.text='+res.text);
          done();
        });
    });

    it('should respond to post request, and send post request to API', function(done) {
      request(app)
        .post('/json/submitForm')
        .end(function(err, res) {
          expect(res.text).toContain('RESPONSE FROM /api/submitform: statusCode=200', 'res.text='+res.text);
          done();
        });
    });

    it('should post url-encoded form submit to API', function(done) {
      request(app)
        .post('/json/submitForm')
        .send({param1:'test1', param2:'test2'})
        .type('form')
        .end(function(err, res) {
          expect(res.text).toContain('"reqBody":{"param1":"test1","param2":"test2"},"reqQuery":{}', 'res.text='+res.text);
          done();
        });
    });

    it('should post JSON body form submit to API', function(done) {
      request(app)
        .post('/json/submitForm')
        .send({ param1:'test1', param2:'test2', isJson: true })
        .type('json')
        .end(function(err, res) {
          expect(res.text).toContain('"reqBody":{"param1":"test1","param2":"test2","isJson":"true"},"reqQuery":{}', 'res.text='+res.text);
          done();
        });
    });

  });
};