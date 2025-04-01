const mongoose = require("mongoose");
const { number } = require("joi");
const { Schema, model, Types } = require('mongoose');
const userSchema = new Schema({
    name: {
        _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
        first: { type: String, required: true, minlength: 2 },
        middle: { type: String },
        last: { type: String, required: true, minlength: 2 }
    },
    isBusiness: {
        type: Boolean,
        required: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
        match: /^(?:\+972|0)(5[0-9])\d{7}$/
    },
    email: {
        type: String,
        required: true,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    address: {
        _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
        state: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        houseNumber: { type: String, required: true },
        zipCode: { type: Number, default: 0 }
    },
    image: {
        _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
        url: { type: String, required: true },
        alt: { type: String, required: true, minlength: 5 }
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = model("users", userSchema);
module.exports = User;