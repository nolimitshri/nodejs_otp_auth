const express = require("express");
const router = express.Router();

const User = require("../model/User");
const Token = require("../model/Token");

const mailer = require("./mailer");
const bcryptjs = require("bcryptjs");

const crypto = require("crypto");

router.get("/forgot-password", (req, res) => {
    res.render("forgotPassword", {
        csrfToken: req.csrfToken(),
    });
});

router.post("/forgot-password", async(req, res) => {
    const {email} = req.body;
    if(!email){
        res.render("forgotPassword", {
            csrfToken: req.csrfToken(),
            msg: "Please Provide an email !",
            type2: 'danger'
        });
    } else {
        const userData = await User.findOne({email: email});
        if(userData){
            if(userData.provider === 'google'){
                res.render("forgotPassword", {
                    csrfToken: req.csrfToken(),
                    msg: "Please Login via Google !",
                    type2: "danger"
                });
            } else {
                const token = crypto.randomBytes(32).toString("hex");
                const newToken = Token({
                    token: token,
                    email: email
                });
                try{
                    const tok = await newToken.save();
                    mailer.sendResetPasswordEmail(email, token);
                    res.render("forgotPassword", {
                        csrfToken: req.csrfToken(),
                        type2: "success",
                        msg: "Reset Link Sent ( Please do check the Spam section for our Email ) !"
                    });
                }catch(e){
                    console.log(e);
                }

            }   
        } else {
            res.render("forgotPassword", {
                csrfToken: req.csrfToken(),
                msg: "The email does not exist !",
                type2: "danger"
            });
        }
    }
});

router.get("/resetPassword", async(req, res) => {
    const token = req.query.token;
    if(token){
        const tok = await Token.findOne({token: token});
        if(tok){
            res.render("forgotPassword", {csrfToken: req.csrfToken(), reset: true, email: tok.email});
        } else {
            res.render("forgotPassword", {
                csrfToken: req.csrfToken(),
                type2: "danger",
                msg: "Token is tampered or Expired !"
            });
        }
    } else {
        res.redirect("/login");
    }
});

router.post("/resetPassword", async(req, res) => {
    const {email, password} = req.body;

    var salt = await bcryptjs.genSalt(12);
        if (salt) {
            var hash = await bcryptjs.hash(password, salt);
            await User.findOneAndUpdate({ email: email }, { $set: { password: hash, isVerified: false } });
            req.flash("success_msg", "Password is reset, now Log in !");
            res.redirect('/login');
        } else {
            res.render('forgotPassword', { csrfToken: req.csrfToken(), reset: true, msg: "Unexpected Error Try Again", email: email });
        }
});


module.exports = router;