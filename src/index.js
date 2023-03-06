const Servidor = require("./Servidor")
const express = require("express");
const { Logger } = require("./Logger");
const app = express()
require("dotenv").config()

if (process.argv.length === 2) { 
    console.error('Coloque al menos un argumento del siguiente ejemplo:'); 
    console.error("  [command] -- -m=[development/production] -p=[PORT] -db=[local/remote] -dbname=[nombre_db]");
    console.error("  [command] -- -default");
    process.exit(1); 
} 

if (process.argv[2] === "-default") {
    Logger.logWarn("Servidor con valores por defecto")
}else{
    for (let index = 2; index < process.argv.length ; index++) {
        let command = process.argv[index].split("=");
        if (command.length === 1) {
            console.error('Use la siguiente guía -p=80'); 
            process.exit(1); 
        }
        switch (command[0]) {
            case "-p":
                process.env.PORTSERV = command[1]
                break;
            case "-m":
                if (command[1] === "development") {
                    process.env.MODE = "development";
                }else if(command[1] === "production"){
                    process.env.MODE = "production";
                }else{
                    console.error(`El valor ${command[1]} no es válido, use development o production en su lugar`); 
                    process.exit(1); 
                }
                break;
            case "-dbname":
                process.env.DB_MONGODB = command[1]
                break;
            case "-db":
                if (command[1] === "local") {
                    process.env.URI_MONGODB = "mongodb://127.0.0.1:27017";
                }else if(command[1] === "remote"){
                    process.env.URI_MONGODB = `mongodb+srv://${DB_LOGIN}:${DB_PASSWORD}@serveruse.bdglnll.mongodb.net/?retryWrites=true&w=majority`;
                }else{
                    console.error(`El valor ${command[1]} no es válido, use local o remote en su lugar`); 
                    process.exit(1); 
                }
                break;        
            default:
                console.error(`El argumento ${command[0]} no es válido`); 
                process.exit(1); 
        }
    }
}


Servidor.runServer(app)
