const Database = require("../Database");
const { Logger } = require("../Logger");
const { ErrorHTTP } = require("../models");
const conn = Database.conn

const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' }
  };

function handleCollectionDb(_collec) {
    async function find(_filter, _proyection = null){
        try {
            return await conn.db.collection( _collec ).find( _filter, _proyection ? { projection: _proyection } : {} ).toArray();
        } catch (error) {
            Logger.logErr(error);
            throw new ErrorHTTP(`No se pudieron obtener los registros`, 500);
        }
    }

    async function findOne(_filter, _proyection = null) {
        try {
            return await conn.db.collection( _collec ).findOne(  _filter, _proyection ? { projection: _proyection } : {} );
        } catch (error) {
            Logger.logErr(error);
            throw new ErrorHTTP(`No se pudo obtener el registro buscado`, 500);
        }
    }

    async function insertOne( _newdocument ) {
        try {
            await conn.db.collection( _collec ).insertOne( _newdocument );
            return null;
        } catch (error) {
            Logger.logErr(error);
            throw new ErrorHTTP(`No se pudo ingresar ese registro`, 500);
        }
    }

    async function updateOne(_filter, _update={}, _config={}) {
        try {
            await conn.db.collection( _collec ).updateOne(_filter, _update, _config);
            return null;
        } catch (error) {
            Logger.logErr(error);
            throw new ErrorHTTP(`No se pudo actualizar ese registro`, 500);
        }
    }

    async function deleteOne(_filter, _config={}) {
        try {
            await conn.db.collection( _collec ).deleteOne(_filter, _config);
            return null;
        } catch (error) {
            Logger.logErr(error);
            throw new ErrorHTTP(`No se pudo eliminar ese registro`, 500);
        }
    }

    async function createSession() {
        const session = conn.connection.startSession()
        return {session, options: transactionOptions};
    }

    return Object.freeze({
        find,
        findOne,
        insertOne,
        updateOne,
        createSession,
        deleteOne
      });

}

module.exports = handleCollectionDb