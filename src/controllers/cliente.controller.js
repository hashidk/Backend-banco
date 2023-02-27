const {makeUCClientes, makeUCCuentas, makeUCBancos} = require("../use-cases")
const { getCliente } = makeUCClientes()
const { getCuentasByCliente, getCuentaByCliente, getCuentaById, 
    transferInternAsNonTransaction, getCuentasDiffById, updateCuenta,
    reqTransferirBanco, testBanco, addTranferenciaExterna} = makeUCCuentas();
const { getBanco, getBancos4Client } = makeUCBancos()
const {TransferenciaInterna,TransferenciaExterna} = require("../models");
const { validators } = require("../utils");
require("dotenv").config()

function clientesControllers() {
    async function getInfo(req, res) {
        const { nickname } = res.locals.user 

        try {
            var result = await getCliente(nickname)
            return res.status(200).send({data:result})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function getCuentas(req, res) {
        const { nickname } = res.locals.user 
        try {
            var result = await getCuentasByCliente(nickname)
            return res.status(200).send({data:result})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function getBancos(req, res) {
        try {
            var result = await getBancos4Client()
            return res.status(200).send({data:result})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }  
    }

    async function getOtrasCuentas(req, res) {
        const { idCuenta } = req.params;
        try {
            var result = await getCuentasDiffById(idCuenta)
            return res.status(200).send({data:result})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }
    
    async function getCuenta(req, res) {
        const { nickname } = res.locals.user 
        const { idCuenta } = req.params;
        try {
            var result = await getCuentaByCliente(nickname, idCuenta)
            if (!result) {
                return res.status(400).send({message:"No posee esta cuenta o no es parte de ella"})
            }else{
                return res.status(200).send({data:result})
            }
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function transferencia_interna(req, res) {
        const { idCuenta } = req.params;
        const { nickname } = res.locals.user 
        var { monto, cuentaDestino } = req.body
        if (!monto || !cuentaDestino) {
            return res.status(400).send({message:"Enviar todos los datos necesarios"})
        }
        
        //Validar datos
        try {
            await validators.validNumber().monto.validateAsync({value: monto})
            await validators.validString("cuenta destino").anystring.validateAsync({value: cuentaDestino})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }


        if (idCuenta === cuentaDestino) {
            return res.status(400).send({message:"No es posible transferir dinero a la misma cuenta"})
        }
        monto = Math.round(parseFloat(monto)*100)/100

        if (monto <= 0) {
            return res.status(400).send({message:"El monto debe ser un valor distinto de cero o negativo"})
        }

        try {
            var cuenta = await getCuentaByCliente(nickname, idCuenta)
            if (!cuenta) {
                return res.status(400).send({message:"No posee la cuenta de origen o no es parte de ella"})
            }
            //Verificar si existen los fondos necesarios
            if (cuenta.monto < monto) {
                return res.status(400).send({message:"No existen los fondos suficientes"})
            }
            
            // Verificar si no excede al limite
            if (!TransferenciaInterna.verificarLimite(monto)) {
                return res.status(400).send({message:"El limite excede al limite de transferencia"})
            }
            
            //Verificar si existe la otra cuenta cuentas
            var cuenta2 = await getCuentaById(cuentaDestino)
            if (!cuenta2) {
                return res.status(400).send({message:"La cuenta destino no existe"})
            }

            //Realizar la transferencia
            await transferInternAsNonTransaction(cuenta._id, cuenta2._id, monto)
            
            return res.status(200).send({message:"Transferencia realizada exitosamente"})

        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function transferencia_externa(req, res) {
        const { idCuenta } = req.params;
        const { nickname } = res.locals.user 
        var { monto, cuentaDestino, banco } = req.body
        if (!monto || !cuentaDestino || !banco) {
            return res.status(400).send({message:"Enviar todos los datos necesarios"})
        }

        //Validar datos
        try {
            await validators.validNumber().monto.validateAsync({value: monto})
            await validators.validString("cuenta destino").anystring.validateAsync({value: cuentaDestino})
            await validators.validString("banco").anystring.validateAsync({value: banco})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }

        monto = Math.round(parseFloat(monto)*100)/100

        try {
            var cuenta = await getCuentaByCliente(nickname, idCuenta)
            if (!cuenta) {
                return res.status(400).send({message:"No posee la cuenta de origen o no es parte de ella"})
            }
            //Verificar si existen los fondos necesarios
            if (cuenta.monto < monto) {
                return res.status(400).send({message:"No existen los fondos suficientes"})
            }
            
            // Verificar si no excede al limite
            if (!TransferenciaExterna.verificarLimite(monto)) {
                return res.status(400).send({message:"El limite excede a al limite de transferencia"})
            }
            
            // Verificar que exista ese banco dentro de la base de datos
            var bancoss = await getBanco(banco)
            if (!bancoss) return res.status(400).send({message:"Ese banco no se encuentra registrado"})

            //Verificar conexión con el banco
            await testBanco(bancoss.dominio+bancoss.prueba)

            //Realizar transacción
            await reqTransferirBanco(
                bancoss.dominio+bancoss.transferir, 
                bancoss.usuario, 
                bancoss.password, 
                monto, 
                idCuenta,
                cuentaDestino,
                process.env.NAME || "Banco de Midas"
            )

            //Realizar la transferencia
            cuenta.monto = cuenta.monto - monto;
            await updateCuenta(cuenta)
            
            //Añadir transferencia
            await addTranferenciaExterna(idCuenta, cuentaDestino, monto, bancoss.nombre)
            
            return res.status(200).send({message:"Transferencia realizada exitosamente"})

        } catch (error) {
            if (!error.msg) {
                return res.status(400).send({message:"Error al realizar la petición"})
            }else{
                return res.status(error.code).send({message:error.msg})
            }
        }
    }

    async function receptar_externa(req, res) {
        var { monto, cuentaDestino, cuentaOrigen, nombreBanco } = req.body
        if (!monto || !cuentaDestino || !cuentaOrigen || !nombreBanco) {
            return res.status(400).send({message:"Enviar todos los datos necesarios"})
        }

        //Validar datos
        try {
            await validators.validNumber().monto.validateAsync({value: monto})
            await validators.validString("cuenta destino").anystring.validateAsync({value: cuentaDestino})
            await validators.validString("cuenta origen").anystring.validateAsync({value: cuentaOrigen})
            await validators.validString("banco").anystring.validateAsync({value: nombreBanco})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }

        monto = Math.round(parseFloat(monto)*100)/100

        try {
           
            //Verificar si existe cuenta destino
            var cuenta2 = await getCuentaById(cuentaDestino)
            if (!cuenta2) {
                return res.status(400).send({message:"La cuenta destino no existe"})
            }

            //Realizar la transferencia
            cuenta2.monto = cuenta2.monto + monto;
            await updateCuenta(cuenta2)
            
            //Añadir transferencia
            await addTranferenciaExterna(cuentaOrigen, cuentaDestino, monto, nombreBanco)

            return res.status(200).send({message:"Se ha añadido el monto"})
        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    return Object.freeze({
        getInfo, getCuentas, getCuenta, transferencia_interna, getOtrasCuentas,
        transferencia_externa, receptar_externa, getBancos
    })
}

module.exports = clientesControllers