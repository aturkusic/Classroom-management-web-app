Kalendar = (function () {
    var periodicnaZauzeca = [], vanrednaZauzeca = [];


    function DaLiSePoklapajuTermini(pocetno1, kraj1, pocetno2, kraj2) {
        return ((pocetno1 <= pocetno2 && pocetno2 < kraj2 && kraj2 <= kraj1)
            || (pocetno1 > pocetno2 && pocetno1 < kraj2 && kraj2 <= kraj1)
            || (pocetno1 <= pocetno2 && pocetno2 < kraj1 && kraj2 > kraj1)
            || (pocetno1 > pocetno2 && pocetno2 < kraj2 && kraj2 > kraj1));
    }

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {
        let neskrivenaPolja = kalendarRef.getElementsByClassName("neskrivenoPolje");
        var datum = new Date();
        var godina = datum.getFullYear();
        for (let i = 0; i < periodicnaZauzeca.length; i++) {
            if (sala == periodicnaZauzeca[i].naziv && DaLiSePoklapajuTermini(periodicnaZauzeca[i].pocetak, periodicnaZauzeca[i].kraj, pocetak, kraj)) {
                let pocetniDan = prviDan(mjesec, godina) - 1;
                let pocetniIndex = -1;
                if (periodicnaZauzeca[i].dan >= pocetniDan) pocetniIndex = periodicnaZauzeca[i].dan - pocetniDan;
                else pocetniIndex = 7 - (pocetniDan - periodicnaZauzeca[i].dan);
                if (periodicnaZauzeca[i].semestar == "zimski" && (mjesec == 9 || mjesec == 10 || mjesec == 11 || mjesec == 0)) {
                    for (let i = pocetniIndex; i < danaUMjesecu(mjesec + 1, godina); i += 7) {
                        neskrivenaPolja[i].querySelector("div").classList.remove("slobodna");
                        neskrivenaPolja[i].querySelector("div").classList.add("zauzeta");
                    }

                } else if (periodicnaZauzeca[i].semestar == "ljetni" && (mjesec == 1 || mjesec == 2 || mjesec == 3 || mjesec == 4 || mjesec == 5)) {
                    for (let i = pocetniIndex; i < danaUMjesecu(mjesec + 1, godina); i += 7) {
                        neskrivenaPolja[i].querySelector("div").classList.remove("slobodna");
                        neskrivenaPolja[i].querySelector("div").classList.add("zauzeta");
                    }
                }
            }
        }

        for (let i = 0; i < vanrednaZauzeca.length; i++) {
            let datumString = vanrednaZauzeca[i].datum.split(".");
            let danInt = parseInt(datumString[0]);
            let mjesecInt = parseInt(datumString[1]) - 1;
            let godinaInt = parseInt(datumString[2]);
            if (vanrednaZauzeca[i].naziv == sala && mjesec == mjesecInt && godinaInt == godina && DaLiSePoklapajuTermini(vanrednaZauzeca[i].pocetak, vanrednaZauzeca[i].kraj, pocetak, kraj)) {
                neskrivenaPolja[danInt - 1].querySelector("div").classList.remove("slobodna");
                neskrivenaPolja[danInt - 1].querySelector("div").classList.add("zauzeta");
            }
        }
    }

    function ucitajPodatkeImpl(periodicna, vanredna) {
        periodicnaZauzeca = periodicna;
        vanrednaZauzeca = vanredna;
    }

    function danaUMjesecu(month, year) {
        return new Date(year, month, 0).getDate();
    }

    function prviDan(month, year) {
        var prviDan = new Date(year, month, 1).getDay();
        if (prviDan == 0) prviDan = 7;
        return prviDan;
    }

    function iscrtajKalendarImpl(kalendarRef, mjesec) {
        stringMjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
        var datum = new Date();
        var godina = datum.getFullYear();
        var brojDanaUMjesecu = danaUMjesecu(mjesec + 1, godina);
        var pocetniDan = prviDan(mjesec, godina);
        crtanje = "";
        crtanje += '<div class="imeMjeseca"><b id="imeMjeseca">' +
            stringMjeseci[mjesec] + '</b></div>';
        crtanje += '<div class="dani"><div class="daniUSedmici">' +
            '<div class="box"><p class="boxText">PON</p></div>' +
            '<div class="box"><p class="boxText">UTO</p></div>' +
            '<div class="box"><p class="boxText">SRI</p></div>' +
            '<div class="box"><p class="boxText">CET</p></div>' +
            '<div class="box"><p class="boxText">PET</p></div>' +
            '<div class="box"><p class="boxText">SUB</p></div>' +
            '<div class="box"><p class="boxText">NED</p></div></div></div>';
        crtanje += '<div class="kal">';
        for (let i = 1; i < pocetniDan; i++) {
            crtanje += '<div class="skrivenoPolje rotirano"></div>';
        }
        for (let i = 1; i <= brojDanaUMjesecu; i++) {
            crtanje += '<div class="neskrivenoPolje rotirano">' +
                '<p class="danUMjesecu">' + i + ' </p><div class="slobodna"></div></div>';
        }
        crtanje += '</div>'
        kalendarRef.innerHTML = crtanje;
    }
    return {
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl
    }
}());

var trenutniMjesec = new Date().getMonth();
var mjeseci = { Januar: 0, Februar: 1, Mart: 2, April: 3, Maj: 4, Juni: 5, Juli: 6, August: 7, Septembar: 8, Oktobar: 9, Novembar: 10, Decembar: 11 };
if (document.getElementById("kalendar") !== null)
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
function ucitajVrijednosti() {
    mjesec = document.getElementById("imeMjeseca").textContent;
    sala = document.getElementById("dropLista").value;
    pocetak = document.getElementById("pocetak").value;
    kraj = document.getElementById("kraj").value;
}

if (document.getElementById('podaci') !== null) {
    document.getElementById('podaci').addEventListener('change', function (event) {
        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
        ucitajVrijednosti();
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), mjeseci[mjesec], sala, pocetak, kraj);

    });
}

function prethodniAkcija() {
    document.getElementById("sljedeci").disabled = false;
    if (trenutniMjesec == 1)
        document.getElementById("prethodni").disabled = true;
    if (trenutniMjesec != 0)
        trenutniMjesec--;
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
    ucitajVrijednosti();
    Kalendar.obojiZauzeca(document.getElementById("kalendar"), mjeseci[mjesec], sala, pocetak, kraj);

}

function sljedeciAkcija() {
    document.getElementById("prethodni").disabled = false;
    if (trenutniMjesec == 10)
        document.getElementById("sljedeci").disabled = true;
    if (trenutniMjesec != 11)
        trenutniMjesec++;
    Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
    ucitajVrijednosti();
    Kalendar.obojiZauzeca(document.getElementById("kalendar"), mjeseci[mjesec], sala, pocetak, kraj);

}
