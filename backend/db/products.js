const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    pname: String,
    price:  String,
    unit:   String,
    brand:  String,
    color:  String
});

module.exports = mongoose.model("products", ProductSchema);