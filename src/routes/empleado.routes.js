var rutasEmpleado = require('express').Router();
const controllers = require("../controllers")

rutasEmpleado.get("/info", controllers.empleadoControllers().getInfo)

rutasEmpleado.get("/clientes", controllers.empleadoControllers().getClientes)
rutasEmpleado.post("/clientes", controllers.empleadoControllers().addCliente)
rutasEmpleado.put("/clientes/:idCliente", controllers.empleadoControllers().updateCliente)
rutasEmpleado.delete("/clientes/:idCliente", controllers.empleadoControllers().changeStatusCliente)

rutasEmpleado.get("/cuentas", controllers.empleadoControllers().getCuentas)
rutasEmpleado.post("/cuentas", controllers.empleadoControllers().addCuenta)
rutasEmpleado.put("/cuentas/:idCuenta", controllers.empleadoControllers().updateCuenta)
rutasEmpleado.delete("/cuentas/:idCuenta", controllers.empleadoControllers().changeStatusCuenta)

module.exports = rutasEmpleado;
