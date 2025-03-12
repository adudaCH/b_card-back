const express = require("express");
const Joi = require("joi");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Card = require("../models/Card");
const auth = require("../middlewares/auth");
const _ = require("lodash");
const router = express.Router();

const registerSchema = Joi.object({
    name: Joi.string().required().min(2),
    email: Joi.string().required().email().min(2),
    password: Joi.string().required().min(8),
    isAdmin: Joi.boolean().required(),
    isBusiness: Joi.boolean().required(),
});

// register
router.post("/", async (req, res) => {
    try {
        // 1. body validation
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        // 2. check for existing user
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("User already exists");
        // 3. create user + encrypt password
        user = new User(req.body);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        // 3.5 create card
        const card = new Card({ userId: user._id, products: [], active: true });
        await card.save();
        // 4. create token
        const token = jwt.sign(
            { _id: user._id, isAdmin: user.isAdmin },
            process.env.JWTKEY
        );
        res.status(201).send(token);
    } catch (error) {
        res.status(400).send(error);
    }
});

const loginSchema = Joi.object({
    email: Joi.string().required().email().min(2),
    password: Joi.string().required().min(8),
});

// login
router.post("/login", async (req, res) => {
    try {
        // 1. body validation
        const { error } = loginSchema.validate(req.body);
        console.error(error, "err");
        if (error) return res.status(400).send(error.details[0].message);
        // 2. check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("Email or password are incorrect");
        // 3. compare the password
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result)
            return res.status(400).send("Email or password are incorrect");
        // 4. create token
        const token = jwt.sign(
            { _id: user._id, isAdmin: user.isAdmin },
            process.env.JWTKEY
        );
        res.status(200).send(token);
    } catch (error) {
        res.status(400).send(error);
    }
});

// profile
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.payload._id);
        if (!user) return res.status(404).send("No such user");
        res.status(200).send(_.pick(user, ["_id", "email", "name", "isAdmin"]));
    } catch (error) {
        console.log(error, "err 400");
        res.status(400).send(error);
    }
});

// Change isBusiness status of a registered user
router.patch("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        // search  user by ID
        const user = await User.findById(id);
        if (!user) return res.status(404).send("User not found");
        // change statues to isBusiness
        user.isBusiness = !user.isBusiness;
        await user.save();
        res.status(200).send({ message: "User business status updated", user });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Edit user details (only the user can update)
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        // check if it the same user
        if (req.payload.userId !== id) {
            return res.status(403).send("Access denied.");}
        // update user details
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,});
        if (!updatedUser) return res.status(404).send("User not found");
        res.status(200).send({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/", auth, async (req, res) => {
    try {
        // check if admin
        if (!req.payload.isAdmin) {
            return res.status(403).send("Access denied.");
        }
        // search users in the database 
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        //search user by ID
        const user = await User.findById(id);
        if (!user) return res.status(404).send("User not found");

        // only register users  and admin are authorized 
        if (req.payload.userId !== id && !req.payload.isAdmin) {
            return res.status(403).send("Access denied.");
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});




module.exports = router;
