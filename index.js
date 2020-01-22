const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const db = require('./db.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/pocetna.html");
});

app.get("/osoblje", function (req, res) {
    let nizPredavaca = [];
    db.osoblje.findAll().then(function (users) {
        users.forEach(element => {
            nizPredavaca.push(element.get('ime') + ' ' + element.get('prezime'));
        });
        res.send(nizPredavaca);
    });

});

function dajSemestar(mjesec) {
    if (mjesec == 10 || mjesec == 11 || mjesec == 12 || mjesec == 1)
        return "zimski";
    else if (mjesec == 2 || mjesec == 3 || mjesec == 4 || mjesec == 5 || mjesec == 6)
        return "ljetni";
    return "";
}

app.get("/zauzecaSale", function (req, res) {
    db.rezervacija.findAll({ include: [{ model: db.termin, as: "Termin" }, { model: db.sala, as: "Sala" }, { model: db.osoblje, as: "Osoba" }] }).then(zauzeca => {
        var trenutnoZauzetiProfesori = [];
        var zauzeteSale = [];
        var datum = new Date();
        var danUSedmici = datum.getDay();
        if (danUSedmici == 0) danUSedmici = 7;
        let sati = (datum.getHours() > 10) ? (datum.getHours()) : ('0' + datum.getHours());
        let minute = (datum.getMinutes() > 10) ? (datum.getMinutes()) : ('0' + datum.getMinutes());
        var vrijeme = sati + ":" + minute;
        var semestar = dajSemestar(datum.getMonth() + 1);
        var mjesec = datum.getMonth() + 1;
        var danUMjesecu = datum.getDate();
        var godina = datum.getFullYear();
        for (let i = 0; i < zauzeca.length; i++) {
            if (zauzeca[i].dataValues.Termin.dataValues.redovni) {
                if (zauzeca[i].dataValues.Termin.dataValues.semestar == semestar && zauzeca[i].dataValues.Termin.dataValues.dan == (danUSedmici - 1)
                    && zauzeca[i].dataValues.Termin.dataValues.pocetak.substring(0, 5) <= vrijeme && vrijeme <= zauzeca[i].dataValues.Termin.dataValues.kraj.substring(0, 5)) {
                    trenutnoZauzetiProfesori.push(zauzeca[i].dataValues.Osoba.dataValues.ime + " " + zauzeca[i].dataValues.Osoba.dataValues.prezime);
                    zauzeteSale.push(zauzeca[i].dataValues.Sala.dataValues.naziv);
                }
            } else {
                var datumIzBaze = zauzeca[i].dataValues.Termin.dataValues.datum.split(".");
                if (parseInt(datumIzBaze[0]) == danUMjesecu && parseInt(datumIzBaze[1]) == mjesec && parseInt(datumIzBaze[2]) == godina
                    && zauzeca[i].dataValues.Termin.dataValues.pocetak.substring(0, 5) <= vrijeme && vrijeme <= zauzeca[i].dataValues.Termin.dataValues.kraj.substring(0, 5)) {
                    trenutnoZauzetiProfesori.push(zauzeca[i].dataValues.Osoba.dataValues.ime + " " + zauzeca[i].dataValues.Osoba.dataValues.prezime);
                    zauzeteSale.push(zauzeca[i].dataValues.Sala.dataValues.naziv);
                }
            }
        }
        let nizPredavaca = [];
        db.osoblje.findAll().then(function (users) {
            users.forEach(element => {
                nizPredavaca.push(element.get('ime') + ' ' + element.get('prezime'));
            });
            res.send({ profesori: trenutnoZauzetiProfesori, sale: zauzeteSale, sviPredavaci: nizPredavaca });
        });


    });
});

app.get("/zauzeca", function (req, res) {
    db.rezervacija.findAll({ include: [{ model: db.termin, as: "Termin" }, { model: db.sala, as: "Sala" }, { model: db.osoblje, as: "Osoba" }] }).then(zauzeca => {
        let zauzeo = [];
        res.send({ zauzecaNiz: zauzeca, zauzeoOsoba: zauzeo });
    });
});

app.get("/sale", function (req, res) {
    let nizSala = [];
    db.sala.findAll().then(function (sale) {
        sale.forEach(element => {
            nizSala.push(element.get('naziv'));
        });
        res.send(nizSala);
    });

});


function DaLiSePoklapajuTermini(pocetno1, kraj1, pocetno2, kraj2) {
    return ((pocetno1 <= pocetno2 && pocetno2 < kraj2 && kraj2 <= kraj1)
        || (pocetno1 > pocetno2 && pocetno1 < kraj2 && kraj2 <= kraj1)
        || (pocetno1 <= pocetno2 && pocetno2 < kraj1 && kraj2 > kraj1)
        || (pocetno1 > pocetno2 && pocetno2 < kraj2 && kraj2 > kraj1));
}

function dajSemestar(mjesec) {
    if (mjesec == 10 || mjesec == 11 || mjesec == 12 || mjesec == 1)
        return "zimski";
    else if (mjesec == 2 || mjesec == 3 || mjesec == 4 || mjesec == 5 || mjesec == 6)
        return "ljetni";
    return "";
}

app.post("/rezervacija.html", function (req, res) {
    var tijelo = req.body;
    var dan = tijelo.dan;
    var indexPosljednjegTerminaUBazi;
    db.rezervacija.findAll({ include: [{ model: db.termin, as: "Termin" }, { model: db.sala, as: "Sala" }, { model: db.osoblje, as: "Osoba" }] }).then(zauzeca => {
        let odbranoPocetnoUMilisekundama = tijelo.pocetak;
        let odbranoKrajnjeUMilisekundama = tijelo.kraj;
        var pronadjen = false;
        var zauzeo;
        let novoubacenaRezervacijaJson;
        if (typeof tijelo.dan !== 'undefined') {
            for (let i = 0; i < zauzeca.length; i++) {
                let pocetnoUMili = zauzeca[i].dataValues.Termin.dataValues.pocetak.substring(0, 5);
                let krajnjeUMili = zauzeca[i].dataValues.Termin.dataValues.kraj.substring(0, 5);
                if (zauzeca[i].dataValues.Termin.dataValues.redovni) {
                    if (zauzeca[i].dataValues.Termin.dataValues.dan == tijelo.dan && zauzeca[i].dataValues.Termin.dataValues.semestar == tijelo.semestar && zauzeca[i].dataValues.Sala.dataValues.naziv == tijelo.naziv
                        && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                        pronadjen = true;
                        zauzeo = zauzeca[i].dataValues.Osoba.dataValues.uloga + " " + zauzeca[i].dataValues.Osoba.dataValues.ime + " " + zauzeca[i].dataValues.Osoba.dataValues.prezime;
                        res.statusCode = 220;
                        break;
                    }
                } else {
                    // trazimo vanredno koje je istog dana kao periodicno jer to ne bi smjelo
                    let nizDatum = zauzeca[i].dataValues.Termin.dataValues.datum.split(".");
                    let danUSedmiciVanrednog = new Date(parseInt(nizDatum[2]), parseInt(nizDatum[1]) - 1, parseInt(nizDatum[0])).getDay();
                    if (danUSedmiciVanrednog == 0) danUSedmiciVanrednog = 6;
                    else danUSedmiciVanrednog--;
                    let semestar = dajSemestar(parseInt(nizDatum[1]));
                    if (zauzeca[i].dataValues.Sala.dataValues.naziv == tijelo.naziv && danUSedmiciVanrednog == tijelo.dan && semestar == tijelo.semestar
                        && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                        pronadjen = true;
                        zauzeo = zauzeca[i].dataValues.Osoba.dataValues.uloga + " " + zauzeca[i].dataValues.Osoba.dataValues.ime + " " + zauzeca[i].dataValues.Osoba.dataValues.prezime;
                        res.statusCode = 220;
                        break;
                    }

                }
            }
            if (!pronadjen) {
                novoubacenaRezervacijaJson = {
                    redovni: 'true', dan: dan, datum: null, semestar: tijelo.semestar, pocetak: tijelo.pocetak, kraj: tijelo.kraj, sala: tijelo.naziv,
                    predavac: tijelo.imePredavaca
                };
                db.termin.create({ redovni: 'true', dan: dan, datum: null, semestar: tijelo.semestar, pocetak: tijelo.pocetak, kraj: tijelo.kraj }).then(result =>
                    db.rezervacija.create({ termin: result.id, sala: tijelo.sala, osoba: tijelo.predavac }));
            }
        } else {
            for (let i = 0; i < zauzeca.length; i++) {
                let pocetnoUMili = zauzeca[i].dataValues.Termin.dataValues.pocetak.substring(0, 5);
                let krajnjeUMili = zauzeca[i].dataValues.Termin.dataValues.kraj.substring(0, 5);
                if (!zauzeca[i].dataValues.Termin.dataValues.redovni) {
                    if (zauzeca[i].dataValues.Termin.dataValues.datum == tijelo.datum && zauzeca[i].dataValues.Sala.dataValues.naziv == tijelo.naziv
                        && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                        pronadjen = true;
                        zauzeo = zauzeca[i].dataValues.Osoba.dataValues.uloga + " " + zauzeca[i].dataValues.Osoba.dataValues.ime + " " + zauzeca[i].dataValues.Osoba.dataValues.prezime;
                        res.statusCode = 221;
                        break;
                    }
                } else {
                    let nizDatum = tijelo.datum.split(".");
                    let danUSedmiciVanrednog = new Date(parseInt(nizDatum[2]), parseInt(nizDatum[1]) - 1, parseInt(nizDatum[0])).getDay();
                    if (danUSedmiciVanrednog == 0) danUSedmiciVanrednog = 6;
                    else danUSedmiciVanrednog--;
                    let semestar = dajSemestar(parseInt(nizDatum[1]));
                    // trazimo periodicno koje je istog dana kao vandredno jer to ne bi smjelo
                    if (zauzeca[i].dataValues.Termin.dataValues.dan == danUSedmiciVanrednog && semestar == zauzeca[i].dataValues.Termin.dataValues.semestar && zauzeca[i].dataValues.Sala.dataValues.naziv == tijelo.naziv
                        && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                        pronadjen = true;
                        zauzeo = zauzeca[i].dataValues.Osoba.dataValues.uloga + " " + zauzeca[i].dataValues.Osoba.dataValues.ime + " " + zauzeca[i].dataValues.Osoba.dataValues.prezime;
                        res.statusCode = 221;
                        break;
                    }
                }

            }
            if (!pronadjen) {
                novoubacenaRezervacijaJson = {
                    redovni: 'false', dan: null, datum: tijelo.datum, semestar: null, pocetak: tijelo.pocetak, kraj: tijelo.kraj, sala: tijelo.naziv,
                    predavac: tijelo.imePredavaca
                };
                db.termin.create({ redovni: 'false', dan: null, datum: tijelo.datum, semestar: null, pocetak: tijelo.pocetak, kraj: tijelo.kraj }).then(result =>
                    db.rezervacija.create({ termin: result.id, sala: tijelo.sala, osoba: tijelo.predavac }));
            }
        }

        res.json({ zauzecaNiz: zauzeca, zauzeoOsoba: zauzeo, nova: novoubacenaRezervacijaJson });

    });
});

app.post("/slike", function (req, res) {
    var tijelo = req.body;
    var odgovorJSON = [];
    fs.readdir(__dirname + "/galerija", function (err, slikeUFolderu) {
        if (Object.entries(tijelo).length === 0 && tijelo.constructor === Object) { // ako je prazan json na pocetku dodati prve tri slike
            odgovorJSON.push(slikeUFolderu[0], slikeUFolderu[1], slikeUFolderu[2]);
            if (slikeUFolderu.length == 3) {
                odgovorJSON.push("nemaViseSlika");
            }
            res.json(odgovorJSON);
            return;
        }
        for (var i = 0; i < slikeUFolderu.length; i++) {
            if (!tijelo.niz.includes(slikeUFolderu[i])) {
                odgovorJSON.push(slikeUFolderu[i]);
                if (odgovorJSON.length == 3)
                    break;
            }
        }
        if (slikeUFolderu.length - tijelo.niz.length <= 3) {
            odgovorJSON.push("nemaViseSlika");
        }

        res.json(odgovorJSON);
    });
});

db.sequelize.sync({ force: true }).then(function () {
    db.inicializacija().then(function () {
        app.listen(8080, 'localhost', function () {
            console.log('App has started');
        });
    });
});

module.exports = app;