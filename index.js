const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/pocetna.html");
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
    var mjeseci = { Januar: 1, Februar: 2, Mart: 3, April: 4, Maj: 5, Juni: 6, Juli: 7, August: 8, Septembar: 9, Oktobar: 10, Novembar: 11, Decembar: 12 };
    fs.readFile('zauzeca.json', (err, data) => {
        if (err) throw err;
        zauzecaJSON = JSON.parse(data);
        //ovo nam daje vrijeme od pocetka dana u milisekundama
        let odbranoPocetnoUMilisekundama = new Date("1970-01-01 " + tijelo.pocetak).getTime() + 3600000;
        let odbranoKrajnjeUMilisekundama = new Date("1970-01-01 " + tijelo.kraj).getTime() + 3600000;
        var pronadjen = false;
        if (typeof dan !== 'undefined') {
            for (let i = 0; i < zauzecaJSON.periodicna.length; i++) {
                let pocetnoUMili = new Date("1970-01-01 " + zauzecaJSON.periodicna[i].pocetak).getTime() + 3600000;
                let krajnjeUMili = new Date("1970-01-01 " + zauzecaJSON.periodicna[i].kraj).getTime() + 3600000;
                if (zauzecaJSON.periodicna[i].dan == tijelo.dan && zauzecaJSON.periodicna[i].semestar == tijelo.semestar && zauzecaJSON.periodicna[i].naziv == tijelo.naziv
                    && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                    pronadjen = true;
                    res.statusCode = 220;
                    break;
                }
            }
            if (!pronadjen) {
                // trazimo vanredno koje je istog dana kao periodicno jer to ne bi smjelo
                for (let i = 0; i < zauzecaJSON.vanredna.length; i++) {
                    let pocetnoUMili = new Date("1970-01-01 " + zauzecaJSON.vanredna[i].pocetak).getTime() + 3600000;
                    let krajnjeUMili = new Date("1970-01-01 " + zauzecaJSON.vanredna[i].kraj).getTime() + 3600000;
                    let nizDatum = zauzecaJSON.vanredna[i].datum.split(".");
                    let danUSedmiciVanrednog = new Date(parseInt(nizDatum[2]), parseInt(nizDatum[1]) - 1, parseInt(nizDatum[0])).getDay();
                    if (danUSedmiciVanrednog == 0) danUSedmiciVanrednog = 6;
                    else danUSedmiciVanrednog--;
                    let semestar = dajSemestar(parseInt(nizDatum[1]));
                    if (zauzecaJSON.vanredna[i].naziv == tijelo.naziv && danUSedmiciVanrednog == tijelo.dan && semestar == tijelo.semestar
                        && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                        pronadjen = true;
                        res.statusCode = 220;
                        break;
                    }
                }
            }
            if (!pronadjen) zauzecaJSON.periodicna.push(tijelo);
        } else {
            for (let i = 0; i < zauzecaJSON.vanredna.length; i++) {
                let pocetnoUMili = new Date("1970-01-01 " + zauzecaJSON.vanredna[i].pocetak).getTime() + 3600000;
                let krajnjeUMili = new Date("1970-01-01 " + zauzecaJSON.vanredna[i].kraj).getTime() + 3600000;
                if (zauzecaJSON.vanredna[i].datum == tijelo.datum && zauzecaJSON.vanredna[i].naziv == tijelo.naziv
                    && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                    pronadjen = true;
                    res.statusCode = 221;
                    break;
                }
            }
            if (!pronadjen) {
                let nizDatum = tijelo.datum.split(".");
                let danUSedmiciVanrednog = new Date(parseInt(nizDatum[2]), parseInt(nizDatum[1]) - 1, parseInt(nizDatum[0])).getDay();
                if (danUSedmiciVanrednog == 0) danUSedmiciVanrednog = 6;
                else danUSedmiciVanrednog--;
                let semestar = dajSemestar(parseInt(nizDatum[1]));
                // trazimo periodicno koje je istog dana kao vandredno jer to ne bi smjelo
                for (let i = 0; i < zauzecaJSON.periodicna.length; i++) {
                    let pocetnoUMili = new Date("1970-01-01 " + zauzecaJSON.periodicna[i].pocetak).getTime() + 3600000;
                    let krajnjeUMili = new Date("1970-01-01 " + zauzecaJSON.periodicna[i].kraj).getTime() + 3600000;
                    if (zauzecaJSON.periodicna[i].dan == danUSedmiciVanrednog && semestar == zauzecaJSON.periodicna[i].semestar && zauzecaJSON.periodicna[i].naziv == tijelo.naziv
                        && DaLiSePoklapajuTermini(pocetnoUMili, krajnjeUMili, odbranoPocetnoUMilisekundama, odbranoKrajnjeUMilisekundama)) {
                        pronadjen = true;
                        res.statusCode = 221;
                        break;
                    }
                }
            }
            if (!pronadjen) zauzecaJSON.vanredna.push(tijelo);
        }
        if (!pronadjen) {
            fs.writeFile('zauzeca.json', JSON.stringify(zauzecaJSON), function (err) {
                if (err) throw err;
            })
        }
        res.json(zauzecaJSON);
    })
});

app.post("/slike", function (req, res) {
    var tijelo = req.body;
    var odgovorJSON = [];
    fs.readdir(__dirname + "/galerija", function (err, slikeUFolderu) {
        if (Object.entries(tijelo).length === 0 && tijelo.constructor === Object) { // ako je prazan json na pocetku dodati prve tri slike
            odgovorJSON.push(slikeUFolderu[0], slikeUFolderu[1], slikeUFolderu[2]);
            if (slikeUFolderu.length  == 3) {
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

app.listen(8080);