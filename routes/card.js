const express = require("express");
const Joi = require("joi");
const Card = require("../models/Card");
const auth = require("../middlewares/auth");
const router = express.Router();

const cardSchema = Joi.object({
    title: Joi.string().required().min(2).trim(),
    subtitle: Joi.string().min(2).trim(),
    description: Joi.string().required().min(10).trim(),
    phone: Joi.string()
        .required()
        .pattern(/^[0-9]{10,15}$/)
        .trim(),
    email: Joi.string().required().email().trim(),
    web: Joi.string().uri().allow("").trim(),
    image: Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().required().min(2).trim(),
    }),
    address: Joi.object({
        state: Joi.string().min(2).trim().default("not defined"),
        country: Joi.string().required().min(2).trim(),
        city: Joi.string().required().min(2).trim(),
        street: Joi.string().required().min(2).trim(),
        houseNumber: Joi.number().required().min(1),
        zip: Joi.number().min(0).default(0),
    }),
    likes: Joi.array().items(Joi.string().hex().length(24)).default([]),
    userId: Joi.string().hex().length(24).required(),
});

// 1. Get ALL cards (Everyone can see them)
router.get("/", async (req, res) => {
    try {
        const cards = await Card.find();
        res.status(200).send(cards);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 2. Get cards by User ID (Requires authentication)
router.get("/user/:userId", auth, async (req, res) => {
    try {
        if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send("Invalid user ID");
        }

        const cards = await Card.find({ userId: req.params.userId });
        if (!cards.length) return res.status(404).send("No cards found");

        res.status(200).send(cards);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 3. Get a single card by ID (Everyone can search)
router.get("/:id", async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send("No such card");

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 4. Get logged-in user's cards (Requires authentication)
router.get("/my-cards", auth, async (req, res) => {
    try {
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        const cards = await Card.find({ userId: req.payload._id });

        res.status(200).send(cards);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 5. Create a new card (Only Business Users can create)
router.post("/", auth, async (req, res) => {
    try {
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");
        if (!req.payload.isBusiness)
            return res.status(403).send("Only business users can create cards");

        const { error } = cardSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const card = new Card({ ...req.body, userId: req.payload._id });
        await card.save();
        res.status(201).send("Card has been added successfully :)");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 6. Edit a card (Only the creator can edit)
router.put("/:cardId", auth, async (req, res) => {
    try {
        const card = await Card.findById(req.params.cardId);
        if (!card) return res.status(404).send("Card not found");

        if (card.userId.toString() !== req.payload._id) {
            return res.status(403).send("Access denied");
        }

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

// 7. Like/Unlike a card (Only registered users)
router.patch("/:id/like", auth, async (req, res) => {
    try {
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send("No such card");

        const userId = req.payload._id;
        const index = card.likes.indexOf(userId);

        if (index === -1) {
            card.likes.push(userId);
        } else {
            card.likes.splice(index, 1);
        }

        await card.save();
        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// 8. Delete a card (Admin or Creator can delete)
router.delete("/:cardId", auth, async (req, res) => {
    try {
        const { cardId } = req.params;
        const card = await Card.findById(cardId);
        if (!card) return res.status(404).send("Card not found");

        if (req.payload.isAdmin || card.userId.toString() === req.payload._id) {
            await card.remove();
            res.status(200).send("Card has been deleted successfully.");
        } else {
            return res.status(403).send("Access denied: Not authorized.");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
