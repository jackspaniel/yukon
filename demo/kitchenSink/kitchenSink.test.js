// FEATURES TESTED:

// multiple APIs
// adding API params at request time
// "magic" templateName based on this filename
// alternate templateName
// alternate templateName with path to folder
// "magic" stubPath based on this filename
// stubPath defined
// adding API call at request time
// "magic" adding :id route wildcard to API path ending in / (common REST paradigm)
// nodule custom API header x-test - tests apiCallback middleware
// system custom API header x-device - tests apiCallBefore API middleware
// alternate API host
// custom API timeout
// force content type json
// "throw" error from postProcessor (app calls next(nodule.error))

var expect  = require('expect');
var request = require('supertest');

module.exports = function(app) {

  describe('Kitchen Sink', function() {
    
    it('Should call multiple APIs and "guess" template based on filename', function(done) {
      request(app)
        .get('/kitchensink')
        .end(function(err, res) {
          expect(res.text).toContain('res.locals.data2 = {"msg":"get data success!', 'res.text='+res.text);
          done();
        });
    });
    
    it('Should find template with alternate declared name', function(done) {
      request(app)
        .get('/kitchensink')
        .query({altTemplateName: 'true'})
        .end(function(err, res) {
          expect(res.text).toContain('<h1>ALTERNATE TEMPLATE NAME Kithen Sink', 'res.text='+res.text);
          done();
        });
    });
    
    it('Should find template with alternate path (not in enclosing folder)', function(done) {
      request(app)
        .get('/kitchensink')
        .query({altTemplatePath: 'true'})
        .end(function(err, res) {
          expect(res.text).toContain('<h1>ALTERNATE TEMPLATE PATH Kithen Sink', 'res.text='+res.text);
          done();
        });
    });
    
    it('Should add api params at init and request time', function(done) {
      request(app)
        .get('/kitchensink')
        .query({myParam: 'test1'})
        .end(function(err, res) {
          expect(res.text).toContain('home page CMS API success!","myParam":"test1', 'res.text='+res.text);
          expect(res.text).toContain('get data success! id=kitchensink","queryPrams":{"staticParam":"test1","myParam":"test1', 'res.text='+res.text);
          done();
        });
    });

    it('Should "guess" stubName based on filename, and use alternate declared stub name', function(done) {
      request(app)
        .get('/kitchensink')
        .end(function(err, res) {
          expect(res.text).toContain('RESPONSE FROM STUB: kitchenSink: statusCode=STUB', 'res.text='+res.text);
          expect(res.text).toContain('RESPONSE FROM STUB: altKitchenSink: statusCode=STUB', 'res.text='+res.text);
          done();
        });
    });
    
    it('GET /bathroomtub/test should add API call at request time based on alternate route', function(done) {
      request(app)
        .get('/bathroomtub/test')
        .end(function(err, res) {
          expect(res.text).toContain('res.locals.data5 = {"msg":"get data success!', 'res.text='+res.text);
          done();
        });
    });
    
    it('GET /bathroomtub/myId for route: /bathroomtub/:id should add :id to last segment of API call: /api/getdata/myId', function(done) {
      request(app)
        .get('/bathroomtub/myId')
        .end(function(err, res) {
          expect(res.text).toContain('res.locals.data5 = {"msg":"get data success! id=myId', 'res.text='+res.text);
          done();
        });
    });
    
    it('Should add custom API headers per nodule and at the system level', function(done) {
      request(app)
        .get('/kitchensink')
        .end(function(err, res) {
          expect(res.text).toContain('"x-test":"success","x-device-type":"web', 'res.text='+res.text);
          done();
        });
    });

    it('Should use alternate API host', function(done) {
      request(app)
        .get('/kitchensink')
        .query({altApiHost: true})
        .end(function(err, res) {
          expect(res.text).toContain('"host":"localhost', 'res.text='+res.text);
          done();
        });
    });

    it('Should change API timeout', function(done) {
      request(app)
        .get('/kitchensink')
        .query({apiTimeout: true})
        .end(function(err, res) {
          expect(res.text).toContain('Error: timeout of 1ms exceeded', 'res.text='+res.text);
          done();
        });
    });

    it('Should set content type to json', function(done) {
      request(app)
        .get('/kitchensink')
        .query({forceJson: true})
        .end(function(err, res) {
          expect(res.text).toMatch(/^\{"data1/, 'res.text='+res.text);
          done();
        });
    });

    it('Should "throw" error from postProcessor by settting nodule.error', function(done) {
      request(app)
        .get('/kitchensink')
        .query({testError: true})
        .end(function(err, res) {
          expect(res.text).toContain('Kitchen Sink Test Error!', 'res.text='+res.text);
          done();
        });
    });

  });
};