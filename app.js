/**
 *  Ayuda: https://funnyfrontend.com/instalar-mongodb-y-uso-de-comandos-basicos/
 */


// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Seteo BodyParser (obtiene cualquier objeto de tipo application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // si hay un error termina todo el proceso
    if (err) throw 'ddd';

    // la base de datos esta arriba
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas (se define un middleware => app.use())
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    // \x1b[32m%s\x1b[0m => coloca el texto en color verde reemplazando el %s
    // \x1b[31m%s\x1b[0m => coloca el texto en color rojo reemplazando el %s
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});