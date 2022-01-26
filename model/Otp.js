const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    Otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    expire_at: {
        type: Date,
        default: Date.now(),
        expires: 600
    }
});

const Otp = mongoose.model("Otp", OtpSchema);

module.exports = Otp;