const Logger = require("./Logger").Logger
const DB = require("./Database") 
const routes = require("./routes")
const middlewares = require("./middlewares")
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const cookieParser = require("cookie-parser");
require("dotenv").config()


function runServer(app) {
    DB.initConnection().then( () =>{
        app.enable('trust proxy')
        app.use(cors({
            credentials: true,
            origin: `${process.env.IPADDRSERV}:${process.env.PORTCLT}`
          }))
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(middlewares.loggermw)
        app.use(cookieParser());
        app.use("/api/", routes)
        app.use(express.static('public'));
        app.use((req, res, next) => {
            res.status(404).sendFile(__dirname + '/404.html');
        })

        // DB.conn.db.collection("Empleados").findOne({_id:1}, {projection: {_id:0, usuario:1}}).toArray().then(resp => {
        //     console.log(resp);
        // })
        

        app.listen(process.env.PORTSERV, () => {
            Logger.logInfo(`Servidor abierto en: ${process.env.IPADDRSERV}:${process.env.PORTSERV} en el modo:${process.env.MODE}`)
        })   
    })
    // .finally( () => {
    //     DB.closeConnection();
    // })
}

module.exports = {runServer}