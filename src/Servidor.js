const Logger = require("./Logger").Logger
const https = require("https");
const fs = require("fs");
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
        app.use("/test", function (req, res) {
            res.status(200).send({message:"ok"})
        })
        app.use("/api/", routes)
        app.use(express.static('public'));
        app.use((req, res, next) => {
            res.status(404).sendFile(__dirname + '/404.html');
        })

        https.createServer({
            key: fs.readFileSync("eckey.key"),
            passphrase: 'will',
            cert: [ fs.readFileSync("eccert.crt") ],
        },app
        )
      .listen(443, ()=>{
        Logger.logInfo(`Servidor abierto en: https://localhost en el modo:${process.env.MODE}`)
        // console.log('server is runing at port https://localhost')
      });
        // app.listen(process.env.PORTSERV, () => {
        //     Logger.logInfo(`Servidor abierto en: ${process.env.IPADDRSERV}:${process.env.PORTSERV} en el modo:${process.env.MODE}`)
        // })   
    })

}

module.exports = {runServer}