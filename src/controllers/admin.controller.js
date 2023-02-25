const { makeUCAdmins, makeUCEmpleados, makeUCBancos } = require("../use-cases")
const { getAdmin } = makeUCAdmins()
const { getEmpleado, createEmpleado, getEmpleadoById, updateEmpleado:updateEmpleadoUS, getEmpleados:getEmpleadosUS} = makeUCEmpleados()
const { getBancos:getBancosUS, getBanco, getBancoByName, createBanco, updateBanco:updateBancoUS } = makeUCBancos()

const { generatePasswordRand, validators } = require("../utils")
const {Empleado, Banco} = require("../models")
const fs = require('fs');

function adminsControllers() {
    async function getInfo(req, res) {
        const { nickname } = res.locals.user 
        try {
            var result = await getAdmin(nickname)
            return res.status(200).send(result)
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }
    }

    async function getEmpleados(req, res) {
        try {
            var result = await getEmpleadosUS()
            return res.status(200).send(result)
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }
    }
    
    async function addEmpleado(req, res) {
        const { nombre, apellido, identificacion, correo } = req.body
        if (!nombre || !apellido || !identificacion || !correo) {
            return res.status(400).send("No se enviaron los datos necesarios")
        }

        try {
            await validators.validString("nombre").anystring.validateAsync({value: nombre})
            await validators.validString("apellido").anystring.validateAsync({value: apellido})
            await validators.validString().identificacion.validateAsync({value: identificacion})
            await validators.validString().email.validateAsync({value: correo})
        } catch (error) {
            return res.status(400).send(error.message)
        }

        try {
            var empleado = await getEmpleado(identificacion);
            if (empleado) return res.status(400).send("El empleado ya existe")

            var password = generatePasswordRand(16)

            //Enviar correo
            const content = `Empleado: Su usuario es: ${identificacion} y su contraseña es: ${password}\n`;
            fs.writeFile('./test.txt', content, { flag: 'a+' }, err => console.error(err));

            var nuevoEmpleado = new Empleado({ nombre, apellido, identificacion, email: correo, password })

            await createEmpleado(nuevoEmpleado.empleado)

            return res.status(200).send("Se ha creado un nuevo empleado")
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }
    }

    async function updateEmpleado(req, res) {
        const { idEmpleado } = req.params;
        const { nombre, apellido, correo } = req.body

        if (!nombre || !apellido || !correo) {
            return res.status(400).send("No enviaron los datos necesarios")
        }

        try {
            await validators.validString("nombre").anystring.validateAsync({value: nombre})
            await validators.validString("apellido").anystring.validateAsync({value: apellido})
            await validators.validString().email.validateAsync({value: correo})
        } catch (error) {
            return res.status(400).send(error.message)
        }

        try {
            var empleado = await getEmpleadoById(idEmpleado);
            if (!empleado) return res.status(400).send("El empleado no existe")
            
            var empl = new Empleado({ nombre, apellido, identificacion: "l", email: correo })
            empl.empleado.usuario.nickname = empleado.usuario.nickname
            empl.empleado.usuario.password = empleado.usuario.password
            empl.empleado.identificacion = empleado.identificacion
            empl.empleado.usuario.salt = empleado.usuario.salt
            empl.empleado._id = empleado._id

            await updateEmpleadoUS(empl.empleado)
            return res.status(200).send("Empleado actualizado");
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }
    }

    async function getBancos(req, res) {
        try {
            var result = await getBancosUS()
            return res.status(200).send(result)
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }
    }

    async function addBanco(req, res) {
        const { id, nombre, usuario, password, dominio, prueba, transferir } = req.body
        if (!id || !nombre || !usuario || !password || !dominio || !prueba || !transferir ) {
            return res.status(400).send("No se enviaron los datos necesarios")
        }

        try {
            await validators.validString("id").anystring.validateAsync({value: id})
            await validators.validString("dominio").anystring.validateAsync({value: dominio})
            await validators.validString("nombre").anystring.validateAsync({value: nombre})
            await validators.validString("usuario").anystring.validateAsync({value: usuario})
            await validators.validString("password").anystring.validateAsync({value: password})
            await validators.validString("prueba").anystring.validateAsync({value: prueba})
            await validators.validString("transferir").anystring.validateAsync({value: transferir})
        } catch (error) {
            return res.status(400).send(error.message)
        }

        try {
            var bancoss = await getBanco(id);
            if (bancoss) return res.status(400).send("El banco externo ya existe con ese id")


            var nuevoBanco = new Banco({ id, nombre, usuario, password, dominio, prueba, transferir })

            await createBanco(nuevoBanco.bank)

            return res.status(200).send("Se ha creado un nuevo banco")
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }   
    }

    async function updateBanco(req, res) {
        const { idBanco } = req.params;
        const { nombre, usuario, password, dominio, prueba, transferir } = req.body
        if (!nombre || !usuario || !password || !dominio || !prueba || !transferir ) {
            return res.status(400).send("No enviaron los datos necesarios")
        }

        try {
            await validators.validString("dominio").anystring.validateAsync({value: dominio})
            await validators.validString("nombre").anystring.validateAsync({value: nombre})
            await validators.validString("usuario").anystring.validateAsync({value: usuario})
            await validators.validString("password").anystring.validateAsync({value: password})
            await validators.validString("prueba").anystring.validateAsync({value: prueba})
            await validators.validString("transferir").anystring.validateAsync({value: transferir})
        } catch (error) {
            return res.status(400).send(error.message)
        }

        try {
            var bancoss = await getBanco(parseInt(idBanco));
            if (!bancoss) return res.status(400).send("El banco no existe")
            
            var nuevoBanco = new Banco({ id: bancoss._id, nombre, usuario, password, dominio, prueba, transferir })


            await updateBancoUS(nuevoBanco.bank)
            return res.status(200).send("Banco actualizado");
        } catch (error) {
            return res.status(error.code).send(error.msg)
        }
    }

    return Object.freeze({
        getInfo, addEmpleado, updateEmpleado, getBancos, addBanco, updateBanco, getEmpleados
    })
}

module.exports = adminsControllers