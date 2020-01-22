const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");
var chai = require("chai");
var chaiHttp = require("chai-http");
const db = require('../db.js');
chai.use(chaiHttp);
var expect = chai.expect;


before(function (done) {
  setTimeout(function () {
    done();
  }, 1800);
});

describe("Testovi", function () {
  it("GET /osoblje status kod 200 i validno osoblje vraćeno", function (done) {
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

  it("GET /zauzeca status kod 200 i validna zauzeca vraćena", function (done) {
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

  it('rezervacija termina, provjera ažuriranja baze', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ datum: '26.01.2020', pocetak: '00:30', kraj: '10:00', naziv: '1-15', predavac: 2, sala: 2 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(200);
        db.termin.findAll({ where: { datum: '26.01.2020' } }).then(termin => {
          assert.equal('00:30:00', termin[0].dataValues.pocetak, "pocetak");
          assert.equal('10:00:00', termin[0].dataValues.kraj, "pocetak");
          done();
        });
      });
  });

  it("GET /sale status kod 200 i validni podaci vraćeni", function (done) {
    supertest(app)
      .get("/sale")
      .end(function (err, res) {
        if (err) done(err);
        var sale = res.body;
        expect(res).to.have.status(200);
        assert.equal(sale.length, 2, "Trebaju biti 2 sale vracene");
        assert.equal(sale[0], '1-11', "Prva sala");
        assert.equal(sale[1], '1-15', "Druga sala");
        done();
      });
  });

  it('rezervacija periodicnog termina koji nije moguce rez., ista osoba', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ dan: 2, semestar: 'zimski', pocetak: '10:00', kraj: '15:00', naziv: '1-11', predavac: 1, sala: 1 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(220); //status 220 u mom programu znaci neuspjesna periodicna rezervacija
        db.termin.findAll({ where: { dan: 2, semestar: 'zimski', pocetak: '10:00', kraj: '15:00' } }).then(termin => {
          assert.equal(typeof termin[0], 'undefined', "ne treba postojati rezervacija");
          done();
        });
      });
  });

  it('rezervacija periodicnog termina koji nije moguce rez., druga osoba/predavac', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ dan: 2, semestar: 'zimski', pocetak: '10:00', kraj: '15:00', naziv: '1-11', predavac: 3, sala: 1 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(220); //status 220 u mom programu znaci neuspjesna periodicna rezervacija
        db.termin.findAll({ where: { dan: 2, semestar: 'zimski', pocetak: '10:00', kraj: '15:00' } }).then(termin => {
          assert.equal(typeof termin[0], 'undefined', "ne treba postojati rezervacija");
          done();
        });
      });
  });

  it('rezervacija vanrednog termina koji nije moguce rez.', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ datum: '26.01.2020', pocetak: '05:00', kraj: '12:00', naziv: '1-15', predavac: 2, sala: 2 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(221); //status 221 u mom programu znaci neuspjesna vanredna rezervacija
        db.termin.findAll({ where: { datum: '26.01.2020', pocetak: '05:00', kraj: '12:00' } }).then(termin => {
          assert.equal(typeof termin[0], 'undefined', "ne treba postojati rezervacija");
          done();
        });
      });
  });

  it('rezervacija vanrednog termina koji se poklapa ali druga sala, treba rezervisati', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ datum: '01.01.2020', pocetak: '12:00', kraj: '14:30', naziv: '1-15', predavac: 2, sala: 2 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(200); 
        db.termin.findAll({ where: { datum: '01.01.2020', pocetak: '12:00', kraj: '14:30' } }).then(termin => {
          assert.notEqual(typeof termin[0], 'undefined', "treba postojati rezervacija");
          assert.equal(termin[0].dataValues.pocetak, '12:00:00', "treba postojati ovaj atribut ako je ubacena rezervacija")
          done();
        });
      });
  });

  it('rezervacija vanrednog termina za vrijeme raspusta', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ datum: '10.08.2020', pocetak: '12:00', kraj: '14:30', naziv: '1-15', predavac: 2, sala: 2 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(200); 
        db.termin.findAll({ where: { datum: '10.08.2020', pocetak: '12:00', kraj: '14:30' } }).then(termin => {
          assert.notEqual(typeof termin[0], 'undefined', "treba postojati rezervacija");
          assert.equal(termin[0].dataValues.datum, '10.08.2020', "treba postojati ovaj atribut ako je ubacena rezervacija")
          done();
        });
      });
  });
  
  it('rezervacija periodicnog termina koji se poklapa sa drugim periodicnim, nece rezervisati', function (done) {
    supertest(app)
      .post('/rezervacija.html')
      .send({ dan: 0, semestar: 'zimski', pocetak: '10:00', kraj: '15:00', naziv: '1-11', predavac: 1, sala: 1 })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) done(err);
        expect(res).to.have.status(220); //status 220 u mom programu znaci neuspjesna periodicna rezervacija
        db.termin.findAll({ where: { dan: 0, semestar: 'zimski', pocetak: '10:00', kraj: '15:00' } }).then(termin => {
          assert.equal(typeof termin[0], 'undefined', "ne treba postojati rezervacija");
          done();
        });
      });
  });

});




