// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // si hay un error termina todo el proceso
    if (err) throw err;

    // la base de datos esta arriba
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    // \x1b[32m%s\x1b[0m => coloca el texto en color verde reemplazando el %s
    // \x1b[31m%s\x1b[0m => coloca el texto en color rojo reemplazando el %s
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});