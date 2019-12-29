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
        var dani = { 0: "ponedeljak", 1: "utorak", 2: "srijedu", 3: "cetvrtak", 4: "petak", 5: "subotu", 6: "nedjelju" };
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

    var nizSlikaZaPrikaz = [];
    var trenutniIndexZandnjePrikazaneSlike = 0;

    function prikaziSlike(urlovi) {
        $("#slika1").attr("src", '/galerija/' + urlovi[0]).fadeIn();
        $("#slika2").attr("src", '/galerija/' + urlovi[1]).fadeIn();
        $("#slika3").attr("src", '/galerija/' + urlovi[2]).fadeIn();
    }

    function ucitajSliku() {
        var url = '/slike';
        $.ajax({
            url: url,
            type: "POST",
            data: { niz: nizSlikaZaPrikaz },
            dataType: "json",
            success: function (response_data_json) {
                view_data = response_data_json;
                console.log(view_data);
                if(view_data.length == 3)
                    nizSlikaZaPrikaz.push(view_data[0], view_data[1], view_data[2]);
                else if(view_data.length == 4 && trenutniIndexZandnjePrikazaneSlike == 3) {
                    document.getElementById("sljedece").disabled = true;
                    nizSlikaZaPrikaz.push(view_data[0], view_data[1], view_data[2], view_data[3]);
                } else {
                    nizSlikaZaPrikaz.push(view_data[0], view_data[1], view_data[2], view_data[3]);
                }
                if(view_data.includes("nemaViseSlika")) {
                    document.getElementById("sljedece").disabled = true;
                    trenutniIndexZandnjePrikazaneSlike += view_data.length - 1;
                } else {
                    trenutniIndexZandnjePrikazaneSlike += 3;
                    document.getElementById("sljedece").disabled = false;
                }
                if(nizSlikaZaPrikaz.length == 3 || trenutniIndexZandnjePrikazaneSlike == 3) {
                    document.getElementById("prethodne").disabled = true;
                } else {
                    document.getElementById("prethodne").disabled = false;
                }
                prikaziSlike(view_data); //Proslijedimo podatke funkciji
            }
        });
    }

    function ucitajSlikeImpl(mjestoPoziva) {
        var filterovana = nizSlikaZaPrikaz.filter(function (el) {
            return typeof el !== 'undefined';
          });
        nizSlikaZaPrikaz = filterovana;
        var zaPromjenu = 0;
        var oduzetDodatIndexa;
        
        if(trenutniIndexZandnjePrikazaneSlike == nizSlikaZaPrikaz.length && mjestoPoziva != "prethodne") {
            ucitajSliku();
        } else if(mjestoPoziva == "prethodne") { //ucitavanje bez ajaksa ukoliko su vec ucitane
            document.getElementById("sljedece").disabled = false; 
            if(nizSlikaZaPrikaz.includes("nemaViseSlika") && ((trenutniIndexZandnjePrikazaneSlike) % 3) != 0) {
                zaPromjenu = (nizSlikaZaPrikaz.length - 1) % 3;
                oduzetDodatIndexa = zaPromjenu + 1;
            } else {
                zaPromjenu = 3;
                oduzetDodatIndexa = 4;
            }
            $("#slika1").attr("src", '/galerija/' + nizSlikaZaPrikaz[trenutniIndexZandnjePrikazaneSlike - (oduzetDodatIndexa + 2)]).fadeIn();
            $("#slika2").attr("src", '/galerija/' + nizSlikaZaPrikaz[trenutniIndexZandnjePrikazaneSlike - (oduzetDodatIndexa + 1)]).fadeIn();
            $("#slika3").attr("src", '/galerija/' + nizSlikaZaPrikaz[trenutniIndexZandnjePrikazaneSlike - oduzetDodatIndexa]).fadeIn();
            trenutniIndexZandnjePrikazaneSlike -= zaPromjenu;
            if(trenutniIndexZandnjePrikazaneSlike == 3)
                document.getElementById("prethodne").disabled = true;
        } else if(mjestoPoziva == "sljedece") { //ucitavanje bez ajaksa ukoliko su vec ucitane
            document.getElementById("prethodne").disabled = false;
            if(nizSlikaZaPrikaz.includes("nemaViseSlika") && ((nizSlikaZaPrikaz.length - 1) - trenutniIndexZandnjePrikazaneSlike) < 3) {
                zaPromjenu = (nizSlikaZaPrikaz.length - 1) - trenutniIndexZandnjePrikazaneSlike;
            } else {
                zaPromjenu = 3;
            }
            $("#slika1").attr("src", '/galerija/' + nizSlikaZaPrikaz[trenutniIndexZandnjePrikazaneSlike]).fadeIn();
            $("#slika2").attr("src", '/galerija/' + nizSlikaZaPrikaz[trenutniIndexZandnjePrikazaneSlike +1]).fadeIn();
            $("#slika3").attr("src", '/galerija/' + nizSlikaZaPrikaz[trenutniIndexZandnjePrikazaneSlike + 2]).fadeIn();
            trenutniIndexZandnjePrikazaneSlike += zaPromjenu;
            if(trenutniIndexZandnjePrikazaneSlike % 3 != 0 || (nizSlikaZaPrikaz.length - 1 - trenutniIndexZandnjePrikazaneSlike) == 0) 
                document.getElementById("sljedece").disabled = true; 
        }
    }

    return {
        ucitajJSON: ucitajJSONImpl,
        rezervisiTermin: rezervisiTerminImpl,
        dajSemestar: dajSemestar,
        ucitajSlike: ucitajSlikeImpl
    }
}());

Pozivi.ucitajJSON("zauzeca.json");