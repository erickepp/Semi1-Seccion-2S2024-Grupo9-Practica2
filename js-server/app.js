const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;


//archivo con la conexion a la db
const db = require('./conexion/conexion');
//Rutas de usuarios
const usersRoutes = require('./routes/user_routes');
const authRoutes = require('./routes/auth_routes');

app.use(express.json());
app.use(morgan('dev'));


//Usar las rutas
app.use('/', usersRoutes,authRoutes);


app.listen(port, () =>{
    console.log(`Servidor escuchando en http://localhost:${port}`);
})
