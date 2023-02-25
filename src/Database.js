const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config()

const uri = process.env.URI_MONGODB || "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const Logger = require("./Logger").Logger

var conn = {
    connection: null,
    db: null
}

async function initConnection(){
    try {
        Logger.logInfo(`Abriendo la conexión a MongoDB en ${process.env.URI_MONGODB.replace(process.env.DB_PASSWORD, "********").replace(process.env.DB_PASSWORD, "********")}...`)
        conn.connection = await client.connect()
        conn.db         = conn.connection.db(process.env.DB_MONGODB || "Banco")
    } catch (error) {
        Logger.logErr("Error al conectar a la base de datos: " + error);
    }
}

function closeConnection() {
    Logger.logInfo("Cerrando la conexión a MongoDB...")
    client.close();
}

module.exports = {
    initConnection,
    conn,
    closeConnection
}