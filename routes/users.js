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
    name: Joi.object({
        first: Joi.string().required().min(2),
        middle: Joi.string(),
        last: Joi.string().required().min(2),
    }),
    isBusiness: Joi.boolean(),
    phone: Joi.string().required().min(10).max(10),
    email: Joi.string().required().email(),
    address: Joi.object({
        state: Joi.string().required(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        houseNumber: Joi.string().required(),
        zipCode: Joi.number(),
    }),
    image: Joi.object({
        url: Joi.string().required(),
        alt: Joi.string().min(5),
    }),
    password: Joi.string().required().min(8),
});

// 1. register **
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

// 2. login
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

// 3. get all users
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

//4. The registered user or admin
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

// 5. Edit user details (only the user can update)
router.put("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        // check if it the same user
        if (req.payload.userId !== id) {
            return res.status(403).send("Access denied.");
        }
        // update user details
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) return res.status(404).send("User not found");
        res.status(200).send({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

//6. Change isBusiness status of a registered user
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

//7. delete user
router.delete("/:id", auth, async (req, res) => {
    try {
        // Ensure user is logged in
        if (!req.payload.loggedIn) return res.status(401).send("Access denied");

        // Allow only the user themselves or an admin to delete the account
        if (req.payload._id !== req.params.id && !req.payload.isAdmin) {
            return res.status(403).send("Access denied");
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send("User not found");

        res.status(200).send("User deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//? profile
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

module.exports = router;
