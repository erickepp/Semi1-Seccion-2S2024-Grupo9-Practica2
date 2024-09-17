const mysql = require('mysql2');
require('dotenv').config();

//Crear la conexion a la base de datos
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT

})

conexion.connect((err) =>{
    if (err) {
        console.error('Error de conexion a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos:', process.env.DB_NAME);
});
module.exports = conexion;