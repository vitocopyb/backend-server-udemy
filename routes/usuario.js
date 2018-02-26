// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// importa el esquema de usuario
var Usuario = require('../models/usuario');

// ====================================================
// Obtener todos los usuarios
// ====================================================
app.get('/', (req, res, next) => {
    // find({}, 'nombre email img role') => busca todos los registros y devuelve los campos especificos separados por espacio
    Usuario
        .find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            // si hay error detiene el proceso
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }

            // retorna si todo sale bien
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

// ====================================================
// Crea un nuevo usuario
// ====================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // req.body => funciona solamente si esta instalado el body-parser
    var body = req.body;

    // crea un objeto Usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    // guarda el objeto
    // usuarioGuardado => es lo que devuelve la base de datos despues de grabar
    usuario.save((err, usuarioGuardado) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        // retorna si todo sale bien
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// ====================================================
// Actualizar usuario
// ====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    // verifica si existe el usuario en base de datos
    Usuario.findById(id, (err, usuario) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        // si no encontro usuario termina el proceso
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        // si no hay ningun error, entoces actualiza los datos del objeto
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            // si hay error detiene el proceso
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            // setea el parametro del password para que no se muestre en la salida (no se esta modificando en base de datos)
            usuarioGuardado.password = ":)";

            // retorna si todo sale bien
            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// ====================================================
// Borra un usuario por id
// ====================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    // busca el registro y lo elimina
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        // si no encontro usuario termina el proceso
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: { message: 'No existe usuario con ese id' }
            });
        }

        // retorna si todo sale bien
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;