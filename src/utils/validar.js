const Joi = require("joi")

function validString(nombre) {
    const anystring = Joi.object().keys({
        value: Joi.string().empty().required().messages({
            "any.required": `El campo [${nombre}] es requerido`,
            "string.empty": `EL campo [${nombre}] no debe estar vacío`,
            "string.base": `EL campo [${nombre}] debe ser una cadena`
          })
    })  
    const code_postal =  Joi.object().keys({
        value: Joi.string().empty().length(6).required().messages({
            "any.required": `El campo [código postal] es requerido`,
            "string.empty": "El campo [código postal] no debe estar vacío",
            "string.length": "El campo [código postal] debe tener una longitud de 6 digitos",
            "string.base": "El campo [código postal] debe ser una cadena"
        }),
    })
    
    const identificacion = Joi.object().keys({
        value: Joi.string().empty().length(10).required().messages({
            "any.required": `El campo [identificacion] es requerido`,
            "string.empty": "El campo [identificacion] no debe estar vacío",
            "string.length": "El campo [identificacion] debe tener una longitud de 10 digitos",
            "string.base": "El campo [identificacion] debe ser una cadena"
        }),
    })
    const email = Joi.object().keys({
        value: Joi.string().empty().email().required().messages({
            "any.required": `El campo [correo] es requerido`,
            "string.empty": "El campo [correo] no debe estar vacío",
            "string.email": `El campo [correo] debe ser un correo válido`,
            "string.base": "El campo [correo] debe ser una cadena"
        })
    })
    const password = Joi.object().keys({
        value: Joi.string().empty().min(8).required().messages({
            "any.required": `La contraseña es requerida`,
            "string.empty": "Este campo no debe estar vacío",
            "string.min": "La contraseña no debe tener una longitud menor a 8",
            "string.base": "La contraseña debe ser un string"
        }),
    })


    return Object.freeze({
        anystring, code_postal, identificacion, email, password
    });  
}

function validNumber(nombre) {
    const monto = Joi.object().keys({
        value: Joi.number().empty().required().positive().messages({
            "any.required": `El campo [monto] es requerida`,
            "number.empty": `El campo [monto] no debe estar vacío`,
            "number.base": `El campo [monto] debe ser un número`,
            "number.positive": `El campo [monto] no debe ser menor o igual a 0`
        })
    })
    
    return Object.freeze({
        monto,
    });  
}

module.exports = {
    validString, validNumber
}