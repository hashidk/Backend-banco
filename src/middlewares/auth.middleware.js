
const jwt = require("jsonwebtoken");
require("dotenv").config()
const SECRET_KEY = process.env.SECRET_KEY || "secret"

const handleCollectionDB = require("../data-access");
const clienteDB = handleCollectionDB("Clientes");
const empleadoDB = handleCollectionDB("Empleados");
const adminDB = handleCollectionDB("Admins");


const authorization = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).send({message:"Inicie sesión para poder ingresar"});
    }

    const data = jwt.verify(token, SECRET_KEY);
    var user = null;
    try {
      switch (data.rol) {
        case "cliente":
            user = await clienteDB.findOne({ identificacion: data.nickname })
            break;
        case "empleado":
            user = await empleadoDB.findOne({ identificacion: data.nickname })
            break;
        case "administrador":
            user = await adminDB.findOne({ identificacion: data.nickname })
            break;
        default:
            return res.status(400).send({message:"Rol incorrecto"});
      }

      var urlTo = req.baseUrl.split("/").slice(-1)[0]
      if ( urlTo !== data.rol && (urlTo === "cliente" || urlTo === "empleado" || urlTo === "administrador")) {
        return res.status(401).send({message:"Acceso no autorizado"});
      }
      if (!user) {
        return res.status(403).send({message:'No se pudo autenticarle, vuelva a intentar'})
      }else{
        res.locals.user = data
        return next();
      }
    } catch(err) {
      return res.status(403).send({message:"Falla al recuperar el token"});
    }
  };


const basicAuth = (req, res, next) => {
  const auth = {login: process.env.BASIC_AUTH_LOGIN, password: process.env.BASIC_AUTH_PASSWORD} // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  if (login && password && login === auth.login && password === auth.password) {
    return next()
  }

  res.status(401).send({message:'Acceso no autorizado, requiere autenticación'}) // custom message
}

  module.exports = {
    authorization, basicAuth
  }