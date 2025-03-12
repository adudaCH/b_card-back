const express = require("express");
const Joi = require("joi");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Card = require("../models/Card");
const auth = require("../middlewares/auth");
const _ = require("lodash");
const router = express.Router();

const cardSchema = Joi.object({
    cardImage: Joi.string().required().min(2),
    cardAlt: Joi.string().required().min(2),
    cardTitle: Joi.string().required().min(8),
    cardSubtitle: Joi.string().required().min(8),
});

// add a new card
router.post("/", auth, async (req, res) => {
    try {
        
        // check if user is logged in
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        // check if user is Business (but don't block normal users)
        if (!req.payload.isBusiness) {
            // Here you can perform additional actions if necessary for normal users
            // For example, check if they are allowed to add the card or if specific data is required for normal users.
        }
        // body validation
        const {error} = cardSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // add card
        const card = new Card(req.body);
        await card.save();
        res.status(201).send("Card has been added successfully :)");
    } catch (error) {
        res.status(400).send(error);
    }
});


// edit card
router.put("/:cardId", auth, async (req, res) => {
    try {
        // check if user is admin or business
        if (!req.payload.isAdmin && !req.payload.isBusiness) return res.status(400).send("Access denied");

        // body validation
        // check if product exists + update
    } catch (error) {
        res.status(400).send(error);
    }
});


// delete
router.delete("/:cardId", auth, async (req, res) => {
    try {
        const { cardId } = req.params;
        
        // find the card by its ID
        const card = await Card.findById(cardId);
        
        if (!card) return res.status(404).send("Card not found");

        // check if user is admin or the card owner
        if (req.payload.isAdmin || card.userId.toString() === req.payload.userId) {
            // delete the card
            await card.remove();
            res.status(200).send("Card has been deleted successfully.");
        } else {
            return res.status(403).send("Access denied: You are not authorized to delete this card.");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

// ! only users can search!!!!!!!!!!!!

// find card
router.get("/:id", auth, async (req, res) => {
    try {
        // check if user is logged in
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        // check if card exists
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(400).send("No such card");

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

// ? not sure what for
router.get("/", auth, async (req, res) => {
    try {
        const card = await Card.find({});
        res.json(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

// ? not sure what for #2

router.get("/:id", auth, async (req, res) => {
    try {
        // check if card exists
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(400).send("No such card");
        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
}); 


// TODO: make a request for the cards & userID

module.exports = router;
