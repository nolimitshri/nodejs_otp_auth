const express = require('express');
const router = express.Router();
const otpGenerator = require('otp-generator');
const mailer = require("./mailer");

const User = require("../model/User");
const Otp = require("../model/Otp");

// NOT A PROTECTED ROUTE
router.get("/verification/:yourEmail", async(req, res) => {
    const urEmail = req.params.yourEmail;
    const user = await User.findOne({email: urEmail});
    // console.log(user);
    
    if(user.isVerifiedEmail || user.isVerifiedPhone){
        req.flash("Your Verification is Complete ! Login to proceed..");
        res.redirect("/login");
    } else {
        res.render("verification", {
            email: urEmail,
            csrfToken: req.csrfToken()
        });
    } 
});

router.post("/verification_email", async(req, res) => {
    const email = req.body.email;
    const user = await User.findOne({email});
    // console.log(email, user);
    if(user){
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        console.log("OTP user.js: " + otp);
        const newOtp = new Otp({
            Otp: otp,
            email: email,
            phone: user.phone
        });
        newOtp.save()
        .then((n_otp) => {
            mailer.sendVerifyEmail(email, otp);
            res.redirect(`/verify_email/${email}`);
        }).catch(e => console.log(e))
        // Login send
    } else {
        res.redirect("/register");
    }
});

router.get("/verify_email/:myEmail", async(req, res) => {
    const urEmail = req.params.myEmail;
    const user1 = await User.findOne({email: urEmail});
    if(!user1){
        req.flash("error_msg", "Please Register Yourself First!!");
        res.redirect("/register");
    }
    res.render("verifyEmail", {
        email: urEmail,
        csrfToken: req.csrfToken()
    });
});

router.post("/verify_email", async(req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    // console.log(email, otp);
    if(otp){
        var otpCheck = await Otp.findOne({Otp: otp, email: email});

        if(otpCheck){
            const userData = await User.findOneAndUpdate({email: otpCheck.email}, {isVerifiedEmail: true}, {new: true, runValidators: true});
            const deleteOtp = await Otp.findOneAndDelete({Otp: otp});
            req.flash("success_msg", "Your Email has been Verified!! Login to Proceed!!");
            res.redirect("/login");
        }
    } else {
        req.flash("error_msg", "Please Retry after Sometime!");
        res.redirect(`/verification/${email}`);
    }
})

module.exports = router;