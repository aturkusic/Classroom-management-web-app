Pozivi = (function () {

    function ucitajJSONImpl(datoteka) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                zauzeca = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
            }

        }
        xhttp.open("GET", datoteka, true);
        xhttp.send();
    }

    function dajSemestar(mjesec) {
        if (mjesec == 10 || mjesec == 11 || mjesec == 12 || mjesec == 1)
            return "zimski";
        else if (mjesec == 2 || mjesec == 3 || mjesec == 4 || mjesec == 5 || mjesec == 6)
            return "ljetni";
        return "";
    }

    function rezervisiTerminImpl(dan, mjesec, sala, pocetak, kraj, daLiJePeriodicno) {
        var mjeseci = { Januar: 1, Februar: 2, Mart: 3, April: 4, Maj: 5, Juni: 6, Juli: 7, August: 8, Septembar: 9, Oktobar: 10, Novembar: 11, Decembar: 12 };
        var dani = { 0 : "ponedeljak", 1: "utorak", 2 : "srijedu", 3: "cetvrtak", 4: "petak", 5: "subotu", 6: "nedjelju" };
        let datum = new Date();
        let godina = datum.getFullYear();
        let danUSedmici = new Date(godina, mjeseci[mjesec] - 1, dan).getDay();
        if (danUSedmici == 0) danUSedmici = 6;
        else danUSedmici--;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () { 
            if (xhttp.readyState == 4 && (xhttp.status == 200 || xhttp.status == 220 || xhttp.status == 221)) {
                let JSONObjekat = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(JSONObjekat.periodicna, JSONObjekat.vanredna);
                var kal = document.getElementById("kalendar");
                Kalendar.iscrtajKalendar(kal, mjeseci[mjesec] - 1);
                Kalendar.obojiZauzeca(kal, mjeseci[mjesec] - 1, sala, pocetak, kraj);
                if (xhttp.status == 221)
                    alert("Nije moguće rezervisati salu " + sala + " za navedeni datum " + dan + "/" + mjeseci[mjesec] + "/" + godina + " i termin od " + pocetak + " do " + kraj + "!");
                else if (xhttp.status == 220)
                    alert("Nije moguće rezervisati salu " + sala + " periodicno u " + dani[danUSedmici] + ", " + dajSemestar(mjeseci[mjesec]) + " semestar, u vrijeme od " + pocetak + " do " + kraj + "!");
            }
        }
        xhttp.open("POST", "rezervacija.html", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        var JSONObjekat;
        if (daLiJePeriodicno) { //da li je termin periodican
            let semestar = dajSemestar(mjeseci[mjesec]);
            if (semestar == "") {
                alert("Nije moguće rezervisati salu " + sala + " periodicno u " + dani[danUSedmici] + ", za vrijeme raspusta, u vrijeme od " + pocetak + " do " + kraj + "!");
                return;
            }
            JSONObjekat = {
                dan: danUSedmici, semestar: semestar, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: "NN"
            }
        } else {
            let datum = dan + '.' + mjeseci[mjesec] + '.' + godina;
            JSONObjekat = {
                datum: datum, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: "NN"
            }
        }
        xhttp.send(JSON.stringify(JSONObjekat));
    }

    return {
        ucitajJSON: ucitajJSONImpl,
        rezervisiTermin: rezervisiTerminImpl,
        dajSemestar: dajSemestar
    }
}());

Pozivi.ucitajJSON("zauzeca.json");