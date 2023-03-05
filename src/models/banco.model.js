class Banco {
    constructor (data){
        this.bank = {
            _id: data.id,
            nombre: data.nombre, 
            usuario: data.usuario, 
            password: data.password, 
            dominio: data.dominio, 
            prueba: data.prueba, 
            transferir: data.transferir
        }
    }
}

module.exports = Banco