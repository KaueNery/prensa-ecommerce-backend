const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const addressSchema = new mongoose.Schema({
        cep: String,
        rua: String,
        bairro: String,
        cidade: String,
        estado: String,
        numero: String,
        complemento: String,
    }, 
    {timestamps: true}
);

module.exports = mongoose.model('Address', addressSchema);