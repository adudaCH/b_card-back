const { Schema, model } = require("mongoose");
const userSchema = new Schema({
    cardImage: {
        type: String,
        required: true,
        minlength: 2,
    },
    cardAlt: {
        type: String,
        required: true,
        minlength: 2,
    },
    cardTitle: {
        type: String,
        required: true,
        minlength: 8,
    },
    cardSubtitle: {
        type: String,
        required: true,
        minlength: 8,
    },
});

const User = model("users", userSchema);
module.exports = User;
