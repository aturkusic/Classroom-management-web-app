Pozivi.ucitajJSON("zauzeca.json");


window.onclick = e => {
    if (e.target.className == "danUMjesecu" || e.target.className == "slobodna" || e.target.className == "zauzeta") {
        var confirmProzor = confirm("Da li zelite da rezervisete ovaj termin?");
        if (confirmProzor == true) {
            var dan, mjesec, sala, pocetak, kraj, cbPeriodicno;
            dan = e.target.parentNode.getElementsByTagName("p").item(0).innerText;
            mjesec = document.getElementById("imeMjeseca").textContent;
            sala = document.getElementById("dropLista").value;
            pocetak = document.getElementById("pocetak").value;
            kraj = document.getElementById("kraj").value;
            cbPeriodicno = document.getElementById("checkBox").checked;
            console.log(sala)
            if(pocetak == "" || kraj == "" || sala == "--") {
                alert("Neispravni podaci");
                return;
            }
            if(pocetak > kraj) {
                alert("Pocetno vrijeme vece od krajnjeg, molimo ispravite.");
                return;
            }
            if (e.target.parentNode.getElementsByTagName("div").item(0).className == "zauzeta") {
                var mjeseci = { Januar: 0, Februar: 1, Mart: 2, April: 3, Maj: 4, Juni: 5, Juli: 6, August: 7, Septembar: 8, Oktobar: 9, Novembar: 10, Decembar: 11 };
                var dani = { 0: "ponedeljak", 1: "utorak", 2: "srijedu", 3: "cetvrtak", 4: "petak", 5: "subotu", 6: "nedjelju" };
                var datum = new Date();
                var godina = datum.getFullYear();
                var danUSedmici = new Date(godina, mjeseci[mjesec], dan).getDay();
                if (danUSedmici == 0) danUSedmici = 6;
                else danUSedmici--;
                if (!cbPeriodicno) 
                    alert("Nije moguce rezervisati salu " + sala + " za navedeni datum " + e.target.parentNode.getElementsByTagName("p").item(0).innerText +
                        "/" + (mjeseci[mjesec] + 1) + "/" + godina + " i termin od " + pocetak + " do " + kraj + "!");
                else {
                    var sem = Pozivi.dajSemestar(mjeseci[mjesec] + 1) + " semestar";
                    if(sem == " semestar") 
                        sem = "za vrijeme raspusta";
                    alert("Nije moguće rezervisati salu " + sala + " periodicno u " + dani[danUSedmici] + ", " + sem + ", u vrijeme od " + pocetak + " do " + kraj + "!");
                }
            } else {
                Pozivi.rezervisiTermin(dan, mjesec, sala, pocetak, kraj, cbPeriodicno);
            }
        } else {

        }
    }
};



