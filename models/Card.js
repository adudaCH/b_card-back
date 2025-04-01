const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    web: { type: String, trim: true, default: "" },
    image: {
        url: { type: String, default: "" },
        alt: { type: String, default: "business card image" }
    },
    address: {
        state: { type: String, default: "not defined" },
        country: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        houseNumber: { type: Number, required: true },
        zip: { type: Number, default: 0 }
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
});

const Card = mongoose.model("Card", cardSchema);
module.exports = Card;


