const uuid = require('uuid');
const User = require("./user.model")

module.exports = class Administrador {
    constructor (data){
        var nuevoUser = new User({
            email:    data.email,
            nickname: data.identificacion
        })
        if (data.password) nuevoUser.encryptPassword(data.password);

        this.empleado = {
            _id: uuid.v4(),
            nombre: data.nombre,
            apellido: data.apellido,
            identificacion: data.identificacion,
            usuario: nuevoUser.data,
        }
    }
}