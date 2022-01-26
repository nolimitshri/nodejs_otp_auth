const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    expire_at: {
        type: Date,
        default: Date.now(),
        expires: 600
    }
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;