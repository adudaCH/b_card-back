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
    cardImage: Joi.string().required().url(),
    cardAlt: Joi.string().required().min(2),
    cardTitle: Joi.string().required().min(8),
    cardSubtitle: Joi.string().required().min(8),
});

// add a new card
router.post("/", auth, async (req, res) => {
    try {
        // check if user is logged in
        // TODO:see if need to check if the user is Business
        //  check for existing card
        // add card
    } catch (error) {
        res.status(400).send(error);
    }
});

// edit card
router.put("/:cardId", auth, async (req, res) => {
    try {
        // check if user is admin or business
        // body validation
        // check if product exists + update
    } catch (error) {
        res.status(400).send(error);
    }
});


// delete
router.delete("/:cardId", auth, async (req, res) => {
    try {
        // check token (admin or card owner)
        // delete
    } catch (error) {
        res.status(400).send(error);
    }
});

//find card
router.get("/", auth, async (req, res) => {
    try {
        // check if card exists
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(400).send("No such card");
        res.status(200).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const card = await Card.find({});
        res.json(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        // check if product exists
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(400).send("No such card");
        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
}); 

module.exports = router;
