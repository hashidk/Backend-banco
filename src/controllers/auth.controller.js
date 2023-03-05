const {makeAuthUsers} = require("../use-cases");
const { validators } = require("../utils");
const {verifyCredentialsUser, genJWT} = makeAuthUsers()
const {getCookieConfig} = require('../utils/config');

function authControllers() {
    async function loginUser(req, res) {
        var {nickname, password, rol} = req.body
        if (!nickname || !password || !rol) 
            return res.status(400).send({message:'Asegurese de ingresar todos los campos'})
    
        try {
            await validators.validString().identificacion.validateAsync({value: nickname})
            await validators.validString("password").anystring.validateAsync({value: password})
            await validators.validString("rol").anystring.validateAsync({value: rol})
        } catch (error) {
            return res.status(400).send({message:error.message})
        }

        try {
            var result = await verifyCredentialsUser(nickname.toLocaleLowerCase(), password, rol)
            return res.cookie("access_token", genJWT(result.nickname, rol), getCookieConfig(process.env.MODE==="production"))
                      .status(200).send({message:"Usuario autenticado"})

        } catch (error) {
            return res.status(error.code).send({message:error.msg})
        }
    }

    async function logOut(req, res) {
        return res.clearCookie("access_token")
                   .status(200)
                   .send({message:"Ha cerrado la sesión"})
    }

    return Object.freeze({
        loginUser,
        logOut
    })
}

module.exports = authControllers