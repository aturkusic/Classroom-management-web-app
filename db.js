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


module.exports=db;