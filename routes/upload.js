// Requires
var express = require('express');
var fileUpload = require('express-fileupload');

// liberia de node => fileSystem
var fs = require('fs');

// Inicializar variables
var app = express();

// importa los esquemas
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    // valida que el tipo sea valido
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    // valida si contiene archivos
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen; // .imagen => es el nombre del parametro que se envia en la peticion
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extesiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // valida que la extension del archivo es la permitida
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // crea nombre de archivo personalizado
    // ejm: 15418826521-345.png ( [id_del_usuario]-[numero_aleatorio].[extension] )
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            // si no encuentra el registro retorna error
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    usuario: { message: 'Usuario no existe' }
                });
            }

            // obtiene el path que tiene asignado actualmente el registro
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe, elimina imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            // si encontro el registro, actualiza su imagen
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                // setea el password para que no lo muestre
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            // si no encuentra el registro retorna error
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    usuario: { message: 'Médico no existe' }
                });
            }
            // obtiene el path que tiene asignado actualmente el registro
            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe, elimina imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            // si encontro el registro, actualiza su imagen
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            // si no encuentra el registro retorna error
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    usuario: { message: 'Hospital no existe' }
                });
            }

            // obtiene el path que tiene asignado actualmente el registro
            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe, elimina imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            // si encontro el registro, actualiza su imagen
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}


module.exports = app;