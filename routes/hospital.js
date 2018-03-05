// Requires
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

// importa el esquema de hospital
var Hospital = require('../models/hospital');

// ====================================================
// Obtener todos los hospitales
// ====================================================
app.get('/', (req, res, next) => {

    // obtiene "desde" que registro comenzara a obtener la informacion
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital
        .find({})
        .skip(desde) // se salta x cantidad de registros, en este caso seran lo que venga en "desde"
        .limit(5) // especifica la cantidad de registros que retornara
        .populate('usuario', 'nombre email') // de la coleccion de usuario retorna los campos nombre, email
        .exec((err, hospitales) => {
            // si hay error detiene el proceso
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            // retorna el total de registros de la coleccion
            Hospital.count({}, (err, conteo) => {
                // retorna si todo sale bien
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});

// ====================================================
// Crea un nuevo hospital
// ====================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // req.body => funciona solamente si esta instalado el body-parser
    var body = req.body;

    // crea un objeto hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    // guarda el objeto
    // hospitalGuardado => es lo que devuelve la base de datos despues de grabar
    hospital.save((err, hospitalGuardado) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        // retorna si todo sale bien
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

// ====================================================
// Actualizar hospital
// ====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    // verifica si existe el hospital en base de datos
    Hospital.findById(id, (err, hospital) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        // si no encontro hospital termina el proceso
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        // si no hay ningun error, entoces actualiza los datos del objeto
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            // si hay error detiene el proceso
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            // retorna si todo sale bien
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ====================================================
// Borra un hospital por id
// ====================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    // busca el registro y lo elimina
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        // si no encontro hospital termina el proceso
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: { message: 'No existe hospital con ese id' }
            });
        }

        // retorna si todo sale bien
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;