// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

// importa el esquema de usuario
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    // consulta si existe el usuario
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        // si no encontro usuario termina el proceso
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // si encontro usuario por email, compara la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // setea el parametro del password para que no se muestre en la salida (no se esta modificando en base de datos)
        usuarioDB.password = ":)";

        // si esta todo bien se crea un token
        var token = jwt.sign({ usuario: usuarioDB }, // payload
            SEED, // llave privada o seed(semilla)
            { expiresIn: 14400 } // tiempo de expiracion 4 hrs
        );

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});



module.exports = app;