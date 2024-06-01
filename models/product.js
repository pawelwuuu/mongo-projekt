const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nazwa: {
        type: String,
        required: true,
        unique: true
    },
    cena: {
        type: Number,
        required: true
    },
    opis: {
        type: String,
        required: false
    },
    ilosc: {
        type: Number,
        required: true
    },
    jednostka_miary: {
        type: String,
        required: false
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;