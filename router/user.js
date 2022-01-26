const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const passport = require("passport");

// Passport requires
require("../config/passport-local")(passport);

const User = require("../model/User");

router.get("/login", (req, res) => {
    res.render("login", {
        csrfToken: req.csrfToken()
    });
});

router.get("/register", (req, res) => {
    res.render("register", {
        csrfToken: req.csrfToken(),
        errors: []
    });
});

// POSTs Request
router.post("/register", async(req, res) => {
    // Validations..
    const { name, phone, email, password, password2 } = req.body;
    let errors = [];

    const userM = await User.findOne({ "$or": [ { email: email }, { phone: phone} ] });

    if(userM !== null){
        if((userM.phone === phone) || (userM.email === email)){
            errors.push({ msg: "User with Email or Phone Number already exists. Please try to Log In" });
        }
    }

    if(!name || !email || !password || !password2 || !phone){
        errors.push({msg: "All fields needed to be filled !!"});
    }

    if(phone.length !== 10){
        errors.push({ msg: "Phone number must be of 10 Digits without National Code !!" })
    }
    
    if(password !== password2){
        errors.push({msg: "Password don't match !!"});
    } 
    
    if(password.length < 6){
        errors.push({msg: "Password length must be greater than 6 !!"});
    } 

    if(errors.length > 0){
        res.render("register", {
            errors: errors,
            name,
            phone,
            email,
            password,
            password2,
            csrfToken: req.csrfToken()
        });

    // If everything is fine..
    } else {
        bcryptjs.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcryptjs.hash(password, salt, (er, hashedPwd) => {
                const newUser = new User({
                    name,
                    phone,
                    email,
                    password: hashedPwd,
                    provider: "email",
                });
                newUser.save()
                .then((user) => {
                    req.flash("success_msg", "Congratulations on registering with us, Please verify your Identity before proceeding !!");
                    res.redirect(`/verification/${user.email}`);
                })
                .catch(e => console.log(e));
            })
        })
    }

});

router.post("/login", async(req, res, next) => {
    const { email } = req.body;
    // console.log(email, password);
    const user = await User.findOne({email: email});
    if(user){
        if(user.isVerifiedEmail || user.isVerifiedPhone){
            passport.authenticate('local', {
                successRedirect: '/dashboard',
                failureRedirect: '/login',
                failureFlash: true })(req, res, next);
            } else {
                req.flash("error_msg", "Please Verify your account !!");
                res.redirect(`/verification/${user.email}`);
        }
    } else {
        req.flash("error_msg", "Please register yourself to Login!!");
        res.redirect("/register");
    }
        
    
});

router.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy(err => {
        res.redirect("/");
    });
});

module.exports = router;