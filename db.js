const Sequelize = require("sequelize");
const sequelize = new Sequelize("DBWT19","root","root",{host:"127.0.0.1",dialect:"mysql",logging:false});
const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//import modela
db.osoblje = sequelize.import(__dirname+'/modeli/Osoblje.js');
db.rezervacija = sequelize.import(__dirname+'/modeli/Rezervacija.js');
db.sala = sequelize.import(__dirname+'/modeli/Sala.js');
db.termin = sequelize.import(__dirname+'/modeli/Termin.js');

//relacije
db.rezervacija.belongsTo(db.osoblje,{foreignKey: 'osoba', as:'Osoba'});
db.osoblje.hasMany(db.rezervacija, {foreignKey: 'osoba', as:'Osoba'});

db.rezervacija.belongsTo(db.termin,{foreignKey: 'termin', as:'Termin'});
db.termin.hasOne(db.rezervacija, {foreignKey: 'termin', as: 'Termin'});

db.rezervacija.belongsTo(db.sala,{foreignKey: 'sala', as:'Sala'});
db.sala.hasMany(db.rezervacija, {foreignKey: 'sala', as: 'Sala'});

db.sala.belongsTo(db.osoblje,{foreignKey: 'zaduzenaOsoba', as:'ZaduzenaOsoba'});
db.osoblje.hasOne(db.sala, {foreignKey: 'zaduzenaOsoba', as: 'ZaduzenaOsoba'});

//inicijalizacija
function inicializacija() {
   return new Promise(function (resolve, reject) {   
      db.osoblje.create({ ime: 'Neko', prezime: 'Nekić', uloga: 'profesor' }).then(function () {
           db.osoblje.create({ ime: 'Drugi', prezime: 'Neko', uloga: 'asistent' }).then(function () {
               db.osoblje.create({ ime: 'Test', prezime: 'Test', uloga: 'asistent' });
               db.termin.create({ redovni: 'false', dan: null, datum: '01.01.2020', semestar: null, pocetak: '12:00', kraj: '13:00' }).then(function () {
                   db.termin.create({ redovni: 'true', dan: 0, datum: null, semestar: 'zimski', pocetak: '13:00', kraj: '14:00' });

                   db.sala.create({ naziv: '1-11', zaduzenaOsoba: '1' }).then(function () {
                       db.sala.create({ naziv: '1-15', zaduzenaOsoba: '2' });

                       db.rezervacija.create({ termin: 1, sala: 1, osoba: 1 }).then(function () {
                           db.rezervacija.create({ termin: 2, sala: 1, osoba: 3 });
                           resolve();
                       });
                   });
               });
           });
       });
   });

}

module.exports = db;
module.exports.inicializacija = inicializacija;