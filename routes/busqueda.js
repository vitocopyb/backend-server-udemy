// Requires
var express = require('express');

// Inicializar variables
var app = express();

// importa el esquema
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ====================================================
// Busqueda por coleccion
// ====================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipo de busqueda solo son: usuarios, medicos y hospitales',
                errors: { message: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // [tabla] => indica que devolvera como atributo el valor que tenga la variable "tabla"
        });
    });
});

// ====================================================
// Busqueda general
// ====================================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    // ejecuta un arreglo de promesas
    Promise
        .all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        // retorna un arreglo de respuestas en la misma posicion que fueron invocadas
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {
    // retorna una promesa
    return new Promise((resolve, reject) => {
        // busca hospitales
        // si usa { nombre: busqueda } => la busqueda es exacta
        // si usa { nombre: /norte/i } => la busqueda con expresion regular hace insensible las mayusculas y minusculas utilizando el texto "norte"
        // si usa { nombre: regex } => utiliza expresion regular para usar la variable "busqueda"
        Hospital
            .find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    // retorna una promesa
    return new Promise((resolve, reject) => {
        Medico
            .find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    // retorna una promesa
    return new Promise((resolve, reject) => {
        Usuario
            .find({}, 'nombre email role')
            // busca por columnas especificas de la coleccion
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;