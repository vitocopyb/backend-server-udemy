// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// importa el esquema de medico
var Medico = require('../models/medico');

// ====================================================
// Obtener todos los medicos
// ====================================================
app.get('/', (req, res, next) => {

    // obtiene "desde" que registro comenzara a obtener la informacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico
        .find({})
        .skip(desde) // se salta x cantidad de registros, en este caso seran lo que venga en "desde"
        .limit(5) // especifica la cantidad de registros que retornara
        .populate('usuario', 'nombre email') // de la coleccion de usuario retorna los campos nombre, email
        .populate('hospital') // de la coleccion de hospital obtiene todos los campos
        .exec((err, medicos) => {
            // si hay error detiene el proceso
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            // retorna el total de registros de la coleccion
            Medico.count({}, (err, conteo) => {
                // retorna si todo sale bien
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

// ====================================================
// Crea un nuevo medico
// ====================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // req.body => funciona solamente si esta instalado el body-parser
    var body = req.body;

    // crea un objeto medico
    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    // guarda el objeto
    // medicoGuardado => es lo que devuelve la base de datos despues de grabar
    medico.save((err, medicoGuardado) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        // retorna si todo sale bien
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ====================================================
// Actualizar medico
// ====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    // verifica si existe el medico en base de datos
    Medico.findById(id, (err, medico) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        // si no encontro medico termina el proceso
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        // si no hay ningun error, entoces actualiza los datos del objeto
        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            // si hay error detiene el proceso
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            // retorna si todo sale bien
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ====================================================
// Borra un medico por id
// ====================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    // busca el registro y lo elimina
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        // si no encontro medico termina el proceso
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: { message: 'No existe medico con ese id' }
            });
        }

        // retorna si todo sale bien
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;