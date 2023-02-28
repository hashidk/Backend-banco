const { makeUCEmpleados, makeUCClientes, makeUCCuentas } = require("../use-cases")
const { getEmpleado } = makeUCEmpleados()
const { getClientes:getClientesUS, getCliente, createCliente, getClienteById, updateCliente:updateClienteUS, changeActiveCliente } = makeUCClientes()
const { getCuentas:getCuentasUS, createCuenta, changeActiveCuenta, updateCuenta:updateCuentaUS, getCuentaById } = makeUCCuentas();

const { generatePasswordRand, validators } = require("../utils")
const { Cliente, Cuenta } = require("../models")
const fs = require('fs');

function empleadosControllers() {
    async function getInfo(req, res) {
        const { nickname } = res.locals.user
        try {
            var result = await getEmpleado(nickname)
            var clientes = await getClientesUS()
            var cuentas = await getCuentasUS()
            var resumen = {
                clientes: clientes.length,
                cuentas: cuentas.length,
            }
            return res.status(200).send({data: result, resumen})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function getClientes(req, res) {
        try {
            var result = await getClientesUS()
            return res.status(200).send({data:result})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function addCliente(req, res) {
        const { nombre, apellido, provincia, ciudad, codigo_postal, identificacion, correo } = req.body
        if (!nombre || !apellido || !provincia || !ciudad || !codigo_postal || !identificacion || !correo) {
            return res.status(400).send({message:"No enviaron los datos necesarios"})
        }

        try {
            await validators.validString("nombre").anystring.validateAsync({value: nombre})
            await validators.validString("apellido").anystring.validateAsync({value: apellido})
            await validators.validString("provincia").anystring.validateAsync({value: provincia})
            await validators.validString("ciudad").anystring.validateAsync({value: ciudad})
            await validators.validString().code_postal.validateAsync({value: codigo_postal})
            await validators.validString().identificacion.validateAsync({value: identificacion})
            await validators.validString().email.validateAsync({value: correo})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }

        try {
            var cliente = await getCliente(identificacion);
            if (cliente) return res.status(400).send({message:"El cliente ya existe"})

            var password = generatePasswordRand(16)

            //Enviar correo
            const content = `Cliente: Su usuario es: ${identificacion} y su contraseña es: ${password}\n`;
            fs.writeFile('./test.txt', content, { flag: 'a+' }, err => console.error(err));

            var nuevoCliente = new Cliente({ nombre, apellido, provincia, ciudad, codigo_postal, identificacion, email: correo, password })

            await createCliente(nuevoCliente.cliente)

            return res.status(200).send({message:"Se ha creado un nuevo cliente"})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function getCuentas(req, res) {
        try {
            var result = await getCuentasUS()
            return res.status(200).send({data:result})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function addCuenta(req, res) {
        var { tipo, clientes } = req.body
        if (!tipo || !clientes) return res.status(400).send({message:"No se enviaron los datos necesarios"})
    
        //Validar datos
        try {
            await validators.validString("tipo").anystring.validateAsync({value: tipo})
        } catch (error) {
            return res.status(400).send(error.message)
        }

        //tratamiento del tipo de cuenta
        if (tipo === "corriente" || tipo === "C") {
            tipo = "C"
        }else if(tipo === "ahorro" || tipo === "A"){
            tipo = "A"
        }else{
            return res.status(400).send({message:"El tipo de cuenta debe ser: ahorro o corriente"});
        }

        try {
            //tratamiento de Clientes
            if (typeof clientes === 'string') {
                clientes = [clientes]
            } else if (Array.isArray(clientes)) {
                clientes = [...new Set(clientes)] //Eliminar repetidos
            } else {
                return res.status(400).send({message:"No ha proporcionado los datos correctos"});
            }

            for (var i in clientes) {
                var resp = await getClienteById(clientes[i]);
                if (!resp) {
                    return res.status(400).send({message:`No existe el cliente con id: ${clientes[i]}`});
                }
            }

            const nuevaCuenta = new Cuenta({ tipo, clientes })
            await createCuenta(nuevaCuenta.cuenta)

            return res.status(200).send({message:"Se ha creado una nueva Cuenta"})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function updateCliente(req, res) {
        const { idCliente } = req.params;

        const { nombre, apellido, provincia, ciudad, codigo_postal, correo } = req.body
        if (!nombre || !apellido || !provincia || !ciudad || !codigo_postal || !correo) {
            return res.status(400).send({message:"No enviaron los datos necesarios"})
        }

        try {
            await validators.validString("nombre").anystring.validateAsync({value: nombre})
            await validators.validString("apellido").anystring.validateAsync({value: apellido})
            await validators.validString("provincia").anystring.validateAsync({value: provincia})
            await validators.validString("ciudad").anystring.validateAsync({value: ciudad})
            await validators.validString().code_postal.validateAsync({value: codigo_postal})
            await validators.validString().email.validateAsync({value: correo})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }

        try {
            var cliente = await getClienteById(idCliente);
            if (!cliente) return res.status(400).send({message:"El cliente no existe"})
            
            var clnt = new Cliente({ nombre, apellido, provincia, ciudad, codigo_postal, identificacion: "l", email: correo })
            clnt.cliente.usuario.password = cliente.usuario.password
            clnt.cliente.usuario.nickname = cliente.usuario.nickname
            clnt.cliente.identificacion = cliente.identificacion
            clnt.cliente.usuario.salt = cliente.usuario.salt
            clnt.cliente.activo = cliente.activo
            clnt.cliente._id = cliente._id

            await updateClienteUS(clnt.cliente)
            return res.status(200).send({message:"Cliente actualizado"});
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function changeStatusCliente(req, res) {
        const { idCliente } = req.params;
        try {
            var cliente = await getClienteById(idCliente);
            if (!cliente) return res.status(400).send({message:"El cliente no existe"})

            await changeActiveCliente(idCliente, cliente.activo)

            return res.status(200).send({message:`Cliente ${cliente.activo ? "desactivado" : "activado"}`});
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function updateCuenta(req, res) {
        const { idCuenta } = req.params;
        const { monto } = req.body

        try {
            validators.validNumber().monto.validateAsync({value: monto})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }

        if (!monto) {
            return res.status(400).send({message:"No enviaron los datos necesarios"})
        }
        try {
            var cuenta = await getCuentaById(idCuenta);
            if (!cuenta) return res.status(400).send({message:"La cuenta no existe"})
            
            cuenta.monto = Math.round(parseFloat(monto)*100)/100

            await updateCuentaUS(cuenta)
            return res.status(200).send({message:"Cuenta actualizada"});
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function changeStatusCuenta(req, res) {
        const { idCuenta } = req.params;
        try {
            var cuenta = await getCuentaById(idCuenta);
            if (!cuenta) return res.status(400).send({message:"La cuenta no existe"})

            await changeActiveCuenta(idCuenta, cuenta.activo)

            return res.status(200).send({message:`Cuenta ${cuenta.activo ? "desactivada" : "activada"}`});
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    return Object.freeze({
        getInfo, getClientes, addCliente, getCuentas, addCuenta, updateCliente, changeStatusCliente,
        updateCuenta, changeStatusCuenta
    })
}

module.exports = empleadosControllers