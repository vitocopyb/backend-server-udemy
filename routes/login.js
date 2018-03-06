// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();

// importa el esquema de usuario
var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ===================================================
// Autenticación de google
// ===================================================
app.post('/google', (req, res) => {
    var token = req.body.token || '';

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
    const ticket = client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });

    ticket.then(data => {
        var payload = data.payload;

        Usuario.findOne({ email: payload.email }, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }

            // si el usuario no fue creado desde google entonces retorna error indicando que se autentique de manera normal
            if (usuario) {
                if (usuario.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticación normal'
                    });
                } else {
                    // setea el parametro del password para que no se muestre en la salida (no se esta modificando en base de datos)
                    usuario.password = ":)";

                    // si esta todo bien se crea un token
                    var token = jwt.sign({ usuario: usuario }, // payload
                        SEED, // llave privada o seed(semilla)
                        { expiresIn: 14400 } // tiempo de expiracion 4 hrs
                    );

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id
                    });
                }
            } else {
                // Si el usuario no existe crea un registro con los datos de google
                var usuarioGoogle = new Usuario();
                usuarioGoogle.nombre = payload.name;
                usuarioGoogle.email = payload.email;
                usuarioGoogle.password = ':)';
                usuarioGoogle.img = payload.picture;
                usuarioGoogle.google = true;

                usuarioGoogle.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        });
                    }

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
            }
        });

    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
    });
});

// ===================================================
// Autenticacón normal
// ===================================================
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