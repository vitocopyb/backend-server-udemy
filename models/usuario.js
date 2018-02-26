// se importa mongoose
var mongoose = require('mongoose');

// se importa un validador de mongoose-unique-validator
var uniqueValidator = require('mongoose-unique-validator');

// inicializa el manejadpr de esquemas
var Schema = mongoose.Schema;

// se definen los roles que son permitidos
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

// se define el esquema del Usuario
var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

// se utiliza el plugin del validador unique
// {PATH} => hace referencia al nombre del campo que se esta validando
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

// exporta el esquema para que sea utilizado en otro lado de la app
module.exports = mongoose.model('Usuario', usuarioSchema);