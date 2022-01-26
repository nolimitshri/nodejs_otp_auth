const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require("bcryptjs");
const User = require("../model/User");

module.exports = (passport) => {
    passport.use(new LocalStrategy( { usernameField: 'email' },
        function(email, password, done) {
            User.findOne({ email: email })
            .then(user => {
                if(!user){
                    return done(null, false, {message: "No user exists with that email !"});
                }

                // User is found Verify for password
                bcryptjs.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;
                    if(isMatch){
                        return done(null, user);
                    } else {
                        return done(null, false, {message: "Password entered is Incorrect !"});
                    }
                });
            });
        }
      ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}