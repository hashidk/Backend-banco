var rutasCliente = require('express').Router();
const controllers = require("../controllers")
rutasCliente.get("/info", controllers.clientesControllers().getInfo )
rutasCliente.get("/cuentas", controllers.clientesControllers().getCuentas)
rutasCliente.get("/cuentas/:idCuenta", controllers.clientesControllers().getCuenta)
rutasCliente.get("/cuentas/:idCuenta/otras", controllers.clientesControllers().getOtrasCuentas)
rutasCliente.post("/cuentas/:idCuenta/transferir/interno", controllers.clientesControllers().transferencia_interna)
rutasCliente.post("/cuentas/:idCuenta/transferir/externo", controllers.clientesControllers().transferencia_externa)
rutasCliente.get("/bancos", controllers.clientesControllers().getBancos)
module.exports = rutasCliente;
