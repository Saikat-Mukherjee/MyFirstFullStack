const mongoose = require("mongoose");

const aspirantSchema = mongoose.Schema({
    name : String,
    dob : Date,
    phone : Number,
    email : String,
    address : String,
    password : String
})

module.exports = mongoose.model("aspirants",aspirantSchema);