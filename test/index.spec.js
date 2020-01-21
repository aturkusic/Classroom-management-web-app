const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");
var chai = require("chai");
var chaiHttp = require("chai-http");
const db = require('../db.js')
chai.use(chaiHttp);
var expect = chai.expect;

/*describe('hooks', function () {
  before(function (done) {
    setTimeout(function () {
      done();
    }, 1000);
  });
*/
  describe("GET /osoblje", function () {
    it("status kod 200 i validni podaci vraćeni", function (done) {
      supertest(app)
        .get("/osoblje")
        .end(function (err, res) {
          if (err) done(err);
          var osoblje = res.body;
          var ocekivano = ["Neko Nekić", "Drugi Neko", "Test Test"];
          expect(res).to.have.status(200);
          expect(JSON.stringify(ocekivano) == JSON.stringify(osoblje)).to.be.true;
          done();
        });
    });
  });
  
  
  /*describe("GET /zauzeca", function () {
    it("status kod 200 i validni podaci vraćeni", function (done) {
      supertest(app)
        .get("/zauzeca")
        .end(function (err, res) {
          if (err) done(err);
          var osoblje = res.body;
          expect(res).to.have.status(200);
          assert.equal(osoblje.zauzecaNiz.length, 2, "Trebaju biti 2 zauzeca");
          assert.equal(osoblje.zauzecaNiz[0].Termin.datum, '01.01.2020', "Datum prve rezervavcije treba biti 01.01.2020");
          assert.equal(osoblje.zauzecaNiz[1].Termin.dan, 0, "Dan druge rezervacije treba biti ponedjeljak tj. 0.");
          done();
        });
    });
  });*/
//});



