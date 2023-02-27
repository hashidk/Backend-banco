const handleCollectionDB = require("../data-access")
const bancosDB = handleCollectionDB("Bancos");

module.exports = function makeUCBancos() {
    async function getBanco( _id ) {
        try {
            return await bancosDB.findOne({ _id });
        } catch (error) {
            throw error;
        }
    };

    async function getBancos( ) {
        try {
            return await bancosDB.find({});
        } catch (error) {
            throw error;
        }
    };

    async function getBancos4Client( ) {
        try {
            return await bancosDB.find({}, {_id:1, nombre:1});
        } catch (error) {
            throw error;
        }
    };

    async function getBancoByName( nombre ) {
        try {
            return await bancosDB.findOne({ nombre });
        } catch (error) {
            throw error;
        }
    };

    async function createBanco(banco) {
        try {
            await bancosDB.insertOne(banco);
            return null;    
        } catch (error) {
            throw error;   
        }
    }

    async function updateBanco(banco) {
        try {
            const _id = banco._id
            delete banco._id
            await bancosDB.updateOne({ _id }, {$set: banco});
            return null;    
        } catch (error) {
            throw error;   
        }
    }

    async function deleteBanco(_id) {
        try {
            await bancosDB.deleteOne({ _id });
            return null;    
        } catch (error) {
            throw error;   
        }
    }

    return Object.freeze({
        getBancos, getBanco, createBanco, updateBanco, getBancoByName, getBancos4Client, deleteBanco
    })
  }