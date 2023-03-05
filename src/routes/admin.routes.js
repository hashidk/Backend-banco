var rutasAdmin = require('express').Router();
const controllers = require("../controllers")

rutasAdmin.get("/info", controllers.adminsControllers().getInfo)
rutasAdmin.get("/empleados", controllers.adminsControllers().getEmpleados)
rutasAdmin.post("/empleados", controllers.adminsControllers().addEmpleado)
rutasAdmin.put("/empleados/:idEmpleado", controllers.adminsControllers().updateEmpleado)
rutasAdmin.delete("/empleados/:idEmpleado", controllers.adminsControllers().changeStatusEmpleado)

rutasAdmin.get("/bancos", controllers.adminsControllers().getBancos)
rutasAdmin.post("/bancos", controllers.adminsControllers().addBanco)
rutasAdmin.put("/bancos/:idBanco", controllers.adminsControllers().updateBanco)
rutasAdmin.delete("/bancos/:idBanco", controllers.adminsControllers().deleteBanco)

module.exports = rutasAdmin;