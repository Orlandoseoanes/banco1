const { Sequelize } = require("sequelize");
const iconv = require('iconv-lite');

// Intenta registrar la codificación 'cesu8'
iconv.encodingExists('cesu8');

const sequelize = new Sequelize('MiniBankSystem', 'prueba','tMeque+2023+' ,{
    host:'srv435312.hstgr.cloud',
    dialect: "mysql",
    dialectOptions: {
        charset: 'utf8mb4'
    } 
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection(); // Llamamos a la función para probar la conexión

module.exports = sequelize;
