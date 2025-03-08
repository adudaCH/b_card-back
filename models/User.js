const mongoose = require("mongoose");
const { number } = require("joi");
const { Schema, model } = require("mongoose");
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        minlength: 2,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    phone: {
        type: String,
        required: true,
        match: /^(?:\+972|0)(5[0-9])\d{7}$/ 
    },
    address: {
        type: String,
        required: true,
        minlength: 2,
        // TODO: add state, city, country, street, hoseNO & zip code in a object
    },
    isAdmin: {
        type: Boolean,
        required: true,
    },
    isBusiness: {
        type: Boolean,
        required: true,
        // TODO: check if need to be true or false
    },

});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;