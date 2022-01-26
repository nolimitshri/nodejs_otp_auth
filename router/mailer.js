const mailer = require("nodemailer");

const transport = mailer.createTransport({
    service: "gmail",
    port: 465,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});

module.exports.sendVerifyEmail = async(email, otp) => {
    // console.log("OTP mailerL " + otp);
    await transport.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Verify Your Account for ZaKK Authentications",
        text: `Hey ${email} this email was sent to you beacause you were reviewing for your verification on ZaKK Authentications
        Your OTP  :  ${otp}`
    }, (err, info) => {
        if(err){
            console.log(err);
        } else {
            console.log(info.response);
        }
    });
}

module.exports.sendResetPasswordEmail = async(email, token) => {
    const url = `http://localhost:3000/resetPassword?token=${token}`;
    // console.log(url);
    await transport.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Reset Your Account Password for ZaKK Authentications",
        text: `Hey ${email} this email was sent to you beacause you were trying to reset your account's password on ZaKK Authentications
        Copy or Click on this link to proceed  :  ${url}`
    });
}