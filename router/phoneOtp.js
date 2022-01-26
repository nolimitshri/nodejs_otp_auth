const express = require('express');
const router = express.Router();
const otpGenerator = require('otp-generator');
const fast2sms = require("fast-two-sms");

const User = require("../model/User");
const Otp = require("../model/Otp");

router.post("/verification_phone", async(req, res) => {
    const email = req.body.email;
    const phone = req.body.phone;
    const user = await User.findOne({email: email});

    if(user){
        if(user.phone !== phone){
            req.flash("error_msg", "Phone Number does not match !!")
            res.redirect(`/verification/${email}`)
        } 
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        // console.log("OTP user.js: " + otp);
        const newOtp = new Otp({
            Otp: otp,
            email: email,
            phone: phone
        });
        newOtp.save()
        .then((n_otp) => {
            const message = `Your OTP for ZaKK Authentications is: ${otp}`;
            fast2sms.sendMessage({ authorization: process.env.API_KEY, message: message, numbers: [phone] }).then((resp) => {
                // console.log(resp);
                res.redirect(`/verify_phone/${phone}`);
            }).catch(er => {
                console.log(er);
            })
        }).catch(e => console.log(e))
        
    }
});

router.get("/verify_phone/:urPhone", async(req, res) => {
    const phone = req.params.urPhone;
    const user1 = await User.findOne({phone: phone});
    if(!user1){
        req.flash("error_msg", "Please Register Yourself First!!");
        res.redirect("/register");
    } else {
        if(phone.length !== 10){
            req.flash("error_msg", "Please Register Yourself First!!");
            res.redirect("/register");
        }
        res.render("verifyPhone", {
            phone: phone,
            csrfToken: req.csrfToken()
        })
    }
    
});

router.post("/verify_phone", async(req, res) => {
    const phone = req.body.phone;
    const otp = req.body.otp;
    // console.log(email, otp);
    const user1 = await User.findOne({phone: phone});
    if(otp){
        var otpCheck = await Otp.findOne({Otp: otp, phone: phone});

        if(otpCheck){
            const userData = await User.findOneAndUpdate({phone: otpCheck.phone}, {isVerifiedPhone: true}, {new: true, runValidators: true});
            const deleteOtp = await Otp.findOneAndDelete({Otp: otp});
            req.flash("success_msg", "Your Phone Number has been Verified!! Login to Proceed!!");
            res.redirect("/login");
        }
    } else {
        req.flash("error_msg", "Please Retry after Sometime!");
        res.redirect(`/verification/${user1.email}`);
    }
});


module.exports = router;