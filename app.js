require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const expressLayouts = require('express-ejs-layouts');
const mongoose = require("mongoose");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const MemoryStore = require("memorystore")(expressSession);
const flash = require("connect-flash");
const passport = require("passport");

const PORT = 3000 || process.env.PORT;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// Mongoose Connection Setup
mongoose.connect("mongodb://localhost:27017/authShriDB", {  // HERE USE YOUR LOCAL/ WEB MONGO URI
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Mongoose Set up successfully !!");
}).catch(e => {
    console.log(e);
})

// EJS set
app.use(expressLayouts);
app.set("view engine", "ejs");

// Cookie Setup
app.use(cookieParser(process.env.SESSION_SECRET));

// Session SETUP
app.use(expressSession({
    secret: process.env.SESSION_SECRET, // USE STRONG 32 CHARS SECRET CODE
    resave: true,
    saveUninitialized: false,
    maxAge: 60 * 1000,
    store: new MemoryStore({
        checkPeriod: 86400000
    })
}));

// CSRF Setup
app.use(csrf());

// Flash Setup
app.use(flash());

// Variables Setup
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// Passport Init and Session
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use("/", require("./router/index"));

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));