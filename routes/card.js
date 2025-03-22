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

// TODO: 1. get all cards

//2. my cards
router.get("/my-cards", auth, async (req, res) => {
    try {
        // Ensure user is logged in
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        // Find all cards created by the logged-in user
        const cards = await Card.find({ userId: req.payload._id });

        res.status(200).send(cards);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 3. get card  //? every one can search
router.get("/:id", async (req, res) => {
    try {
        // Check if card exists
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send("No such card");

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 4. create a new card (business users only)
router.post("/", auth, async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        // Allow only business users to create a card
        if (!req.payload.isBusiness)
            return res.status(403).send("Only business users can create cards");

        // Body validation
        const { error } = cardSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Add card
        const card = new Card({ ...req.body, userId: req.payload._id });
        await card.save();
        res.status(201).send("Card has been added successfully :)");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 5. edit card
router.put("/:cardId", auth, async (req, res) => {
    try {
        // Fetch the card from the database
        const card = await Card.findById(req.params.cardId);
        if (!card) return res.status(404).send("Card not found");

        // Check if the user is the creator of the card
        if (card.userId.toString() !== req.payload._id) {
            return res.status(403).send("Access denied");
        }

        // Update the card (assuming validation is done separately)
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.cardId,
            req.body,
            { new: true }
        );
        res.send(updatedCard);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//6. like card
router.patch("/:id/like", auth, async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        // Find the card
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send("No such card");

        // Check if user already liked the card
        const userId = req.payload._id;
        const index = card.likes.indexOf(userId);

        if (index === -1) {
            // If user hasn't liked the card, add like
            card.likes.push(userId);
        } else {
            // If user already liked, remove like (toggle)
            card.likes.splice(index, 1);
        }

        await card.save();
        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 7. delete
router.delete("/:cardId", auth, async (req, res) => {
    try {
        const { cardId } = req.params;

        // find the card by its ID
        const card = await Card.findById(cardId);

        if (!card) return res.status(404).send("Card not found");

        // check if user is admin or the card owner
        if (
            req.payload.isAdmin ||
            card.userId.toString() === req.payload.userId
        ) {
            // delete the card
            await card.remove();
            res.status(200).send("Card has been deleted successfully.");
        } else {
            return res
                .status(403)
                .send(
                    "Access denied: You are not authorized to delete this card."
                );
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

// TODO: make a request for the cards & userID

module.exports = router;
