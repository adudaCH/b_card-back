const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        let token = req.header("Authorization");
        // 1. get token
        console.log(typeof req.header("Authorization"), "type");
        if (typeof token === "string" || token instanceof String) {
            token = JSON.parse(token);
        }
        if (!token)
            return res.status(401).send("Access denied. No token provided");

        // 2. take the payload
        req.payload = jwt.verify(token, process.env.JWTKEY);
        next();
    } catch (error) {
        res.status(400).send(error);
    }
};
