const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const users =require("./routes/users")
const card =require("./routes/card")


const app = express();
const port = process.env.PORT || 5000;

const logger = (req, res, next) => {
    console.log(req.method + req.url);
    next();
};

mongoose
    .connect(process.env.DB)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log(error));


    app.use(cors());
    app.use(express.json());
    app.use(logger);
    app.use("/api/users", users);
    app.use("/api/card", card);


app.listen(port, () => console.log("Server started on port", port));
