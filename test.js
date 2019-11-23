let assert = chai.assert;
describe('Kalendar', function () {
    describe('iscrtajKalendar(kalendar, trenutniMjesec)', function () {
        it('30 dana mjesec', function () {
            let kalendarr = document.getElementById("kalendar");
            Kalendar.iscrtajKalendar(kalendarr, 10);
            let neskrivenaPolja = kalendarr.getElementsByClassName("neskrivenoPolje");
            assert.equal(neskrivenaPolja.length, 30, "Broj polja treba biti 30");
        });

        it('31 dan mjesec', function () {
            let kalendarr = document.getElementById("kalendar");
            Kalendar.iscrtajKalendar(kalendarr, 11);
            let neskrivenaPolja = kalendarr.getElementsByClassName("neskrivenoPolje");
            assert.equal(neskrivenaPolja.length, 31, "Broj polja treba biti 31");
        });

        it('prvi dan petak', function () {
            let kalendarr = document.getElementById("kalendar");
            let prviDan = new Date(2019, 10, 1).getDay();
            if (prviDan == 0) prviDan = 7;
            Kalendar.iscrtajKalendar(kalendarr, 10);
            let Polja = kalendarr.getElementsByClassName("kal").item(0).getElementsByTagName("div").item(prviDan - 1);
            let dani = kalendarr.getElementsByClassName("dani").item(0).getElementsByClassName("daniUSedmici").item(0).getElementsByTagName("div").item(prviDan - 1);
            assert.equal(Polja.innerText, 1, "Vrijednost treba biti 1");
            assert.equal(dani.innerText, "PET", "Vrijednost treba biti PET");
        });

        it('zadnji dan subota', function () {
            let kalendarr = document.getElementById("kalendar");
            let prviDan = new Date(2019, 10, 1).getDay();
            let danaUMjesecu = new Date(2019, 11, 0).getDate();
            if (prviDan == 0) prviDan = 7;
            Kalendar.iscrtajKalendar(kalendarr, 10);
            let polja = kalendarr.getElementsByClassName("kal").item(0).getElementsByClassName("danUMjesecu").item(danaUMjesecu - 1);
            let dani = kalendarr.getElementsByClassName("dani").item(0).getElementsByClassName("daniUSedmici").item(0).getElementsByTagName("div").item((danaUMjesecu + prviDan - 2) % 7);
            assert.equal(polja.innerText, 30, "Vrijednost treba biti 30");
            assert.equal(dani.innerText, "SUB", "Vrijednost treba biti SUB");
        });


        it('1 do 31 januar, prvi utorak', function () {
            let kalendarr = document.getElementById("kalendar");
            let prviDan = new Date(2019, 0, 1).getDay();
            let danaUMjesecu = new Date(2019, 1, 0).getDate();
            if (prviDan == 0) prviDan = 7;
            Kalendar.iscrtajKalendar(kalendarr, 0);
            let jedan = kalendarr.getElementsByClassName("kal").item(0).getElementsByTagName("div").item(prviDan - 1);
            let triesjedan = kalendarr.getElementsByClassName("kal").item(0).getElementsByClassName("danUMjesecu").item(danaUMjesecu - 1);
            let dani = kalendarr.getElementsByClassName("dani").item(0).getElementsByClassName("daniUSedmici").item(0).getElementsByTagName("div").item(prviDan - 1);
            assert.equal(jedan.innerText, 1, "Vrijednost treba biti 1");
            assert.equal(triesjedan.innerText, 31, "Vrijednost treba biti 31");
            assert.equal(dani.innerText, "UTO", "Vrijednost treba biti UTO");
        });

        it('1 do 28 februar, prvi petak', function () {
            let kalendarr = document.getElementById("kalendar");
            let prviDan = new Date(2019, 1, 1).getDay();
            let danaUMjesecu = new Date(2019, 2, 0).getDate();
            if (prviDan == 0) prviDan = 7;
            Kalendar.iscrtajKalendar(kalendarr, 1);
            let jedan = kalendarr.getElementsByClassName("kal").item(0).getElementsByTagName("div").item(prviDan - 1);
            let triesjedan = kalendarr.getElementsByClassName("kal").item(0).getElementsByClassName("danUMjesecu").item(danaUMjesecu - 1);
            let dani = kalendarr.getElementsByClassName("dani").item(0).getElementsByClassName("daniUSedmici").item(0).getElementsByTagName("div").item(prviDan - 1);
            assert.equal(jedan.innerText, 1, "Vrijednost treba biti 1");
            assert.equal(triesjedan.innerText, 28, "Vrijednost treba biti 28");
            assert.equal(dani.innerText, "PET", "Vrijednost treba biti PET");
        });

        it('8. mart petak', function () {
            let kalendarr = document.getElementById("kalendar");
            let prviDan = new Date(2019, 10, 1).getDay();
            if (prviDan == 0) prviDan = 7;
            Kalendar.iscrtajKalendar(kalendarr, 10);
            let polja = kalendarr.getElementsByClassName("kal").item(0).getElementsByClassName("danUMjesecu").item(8 - 1);
            let dani = kalendarr.getElementsByClassName("dani").item(0).getElementsByClassName("daniUSedmici").item(0).getElementsByTagName("div").item((8 + prviDan - 2) % 7);
            assert.equal(polja.innerText, 8, "Vrijednost treba biti 30");
            assert.equal(dani.innerText, "PET", "Vrijednost treba biti PET");
        });

    });

    describe('obojiKalendar(kalendarRef, mjesec, sala, pocetak, kraj)', function () {
        it('svi slobodni kada nema podataka', function () {
            let kalendarr = document.getElementById("kalendar");
            Kalendar.ucitajPodatke([], []);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let zauzeta = kalendarr.getElementsByClassName("zauzeta");
            let slobodna = kalendarr.getElementsByClassName("slobodna");
            assert.equal(zauzeta.length, 0, "Broj zauzetih treba biti 0");
            assert.equal(slobodna.length, 30, "Broj zauzetih treba biti 30");
        });

        it('dupla zauzeca', function () {
            let kalendarr = document.getElementById("kalendar");
            var vanredna = [{ datum: "23.11.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" },
                            { datum: "23.11.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" }];
            Kalendar.ucitajPodatke([], vanredna);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let zauzeta = kalendarr.getElementsByClassName("neskrivenoPolje").item(22).getElementsByClassName("zauzeta");
            assert.equal(zauzeta.length, 1, "Broj zauzetih treba biti 1");
        });

        it('ne obojiti drugi semestar', function () {
            let kalendarr = document.getElementById("kalendar");
            var periodicna = [{dan: 4, semestar: "ljetni", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"}];
            Kalendar.ucitajPodatke(periodicna,[]);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let slobodna = kalendarr.getElementsByClassName("neskrivenoPolje").item(0).getElementsByClassName("slobodna");
            let slobodna1 = kalendarr.getElementsByClassName("neskrivenoPolje").item(7).getElementsByClassName("slobodna");
            let slobodna2 = kalendarr.getElementsByClassName("neskrivenoPolje").item(14).getElementsByClassName("slobodna");
            let slobodna3 = kalendarr.getElementsByClassName("neskrivenoPolje").item(21).getElementsByClassName("slobodna");
            assert.equal(slobodna.length, 1, "Broj slobodnih treba biti 1");
            assert.equal(slobodna1.length, 1, "Broj slobodnih treba biti 1");
            assert.equal(slobodna2.length, 1, "Broj slobodnih treba biti 1");
            assert.equal(slobodna3.length, 1, "Broj slobodnih treba biti 1");
        });

        it('zauzece drugi mjesec', function () {
            let kalendarr = document.getElementById("kalendar");
            var vanredna = [{ datum: "23.9.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" }];
            Kalendar.ucitajPodatke([], vanredna);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let slobodnoPolje = kalendarr.getElementsByClassName("neskrivenoPolje").item(22).getElementsByClassName("zauzeta");
            assert.equal(slobodnoPolje.length, 0 , "Broj zauzetih treba biti 0 jer je slobodno");
        });

        it('ne obojiti drugi semestar', function () {
            let kalendarr = document.getElementById("kalendar");
            var periodicna = [{dan: 0, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 1, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 2, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 3, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 4, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 5, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 6, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"}];
            Kalendar.ucitajPodatke(periodicna,[]);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let slobodna = kalendarr.getElementsByClassName("slobodna")
            assert.equal(slobodna.length, 0, "Broj slobodnih treba biti 0");
        });

        it('ne obojiti drugi semestar', function () {
            let kalendarr = document.getElementById("kalendar");
            var periodicna = [{dan: 0, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 1, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 2, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 3, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 4, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 5, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"},
            {dan: 6, semestar: "zimski", pocetak: "11:00", kraj: "16:00", naziv: "1-01", predavac: "NN"}];
            Kalendar.ucitajPodatke(periodicna,[]);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let slobodna = kalendarr.getElementsByClassName("slobodna")
            assert.equal(slobodna.length, 0, "Broj slobodnih treba biti 0 kao u prethodnom testu");
        });

        it('posljedni podaci se prikazuju', function () {
            let kalendarr = document.getElementById("kalendar");
            var vanredna = [{ datum: "23.11.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" }];
            var vanredna1 = [{ datum: "25.11.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" }];
            Kalendar.ucitajPodatke([], vanredna);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            Kalendar.ucitajPodatke([], vanredna1);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:00", "15:00");
            let zauzeta25 = kalendarr.getElementsByClassName("neskrivenoPolje").item(24).getElementsByClassName("zauzeta");
            let zauzeta23 = kalendarr.getElementsByClassName("neskrivenoPolje").item(22).getElementsByClassName("zauzeta");
            assert.equal(zauzeta25.length, 1 , "Broj zauzetih 25. treba biti 1");
            assert.equal(zauzeta23.length, 0 , "Broj zauzetih 23. treba biti 0");
        });

        it('preklapanje vremena sa pocetkom', function () {
            let kalendarr = document.getElementById("kalendar");
            var vanredna = [{ datum: "23.11.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" }];
            Kalendar.ucitajPodatke([], vanredna);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "11:00", "14:00");
            let zauzeta = kalendarr.getElementsByClassName("neskrivenoPolje").item(22).getElementsByClassName("zauzeta");
            assert.equal(zauzeta.length, 1, "Broj zauzetih treba biti 1 jer se termini djelimicno poklapaju");
        });

        it('preklapanje vremena sa krajem', function () {
            let kalendarr = document.getElementById("kalendar");
            var vanredna = [{ datum: "23.11.2019", pocetak: "13:00", kraj: "15:30", naziv: "1-01", predavac: "NN" }];
            Kalendar.ucitajPodatke([], vanredna);
            Kalendar.iscrtajKalendar(kalendarr, 10);
            Kalendar.obojiZauzeca(kalendarr, 10, "1-01", "13:30", "18:00");
            let zauzeta = kalendarr.getElementsByClassName("neskrivenoPolje").item(22).getElementsByClassName("zauzeta");
            assert.equal(zauzeta.length, 1, "Broj zauzetih treba biti 1 jer se termini djelimicno poklapaju");
        });

    });
});
