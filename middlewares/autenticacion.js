// Requires
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ============================================================================================
// Verificar token (middleware)
// ============================================================================================
exports.verificaToken = function(req, res, next) {
    // recupera toekn enviado por la url
    var token = req.query.token;

    // verifica el token
    jwt.verify(token, SEED, (err, decoded) => {
        // si hay error detiene el proceso
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        // si el token es correcto:

        // -> disponibiliza en el request el usuario del token
        req.usuario = decoded.usuario;

        // -> avanza a la siguiente instruccion
        next();
    });
};