require("dotenv").config();
require("./db/conn"); 
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userSchema");
const invoiceRoutes = require("./invoices/invoice.routes");

const PORT = process.env.PORT || 6005;
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// CORS Middleware
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Secure cookies in production
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000 // One hour session timeout
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new OAuth2Strategy({
    clientID,
    clientSecret,
    callbackURL: "http://localhost:6005/auth/google/callback",
    scope: ["email", "profile"]
}, async (accessToken, refreshToken, profile, done) => {
    console.log("Profile Received:", profile);
    try {
        let user = await userdb.findOne({ googleId: profile.id });

        if (!user) {
            user = new userdb({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });
            await user.save();
            console.log("New User Created:", user);
        } else {
            console.log("User Already Exists:", user);
        }
        return done(null, user);
    } catch (error) {
        console.error("Error Saving User:", error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userdb.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Authentication Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

app.get("/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "http://localhost:3000/dashboard",
        failureRedirect: "http://localhost:3000/login"
    })
);

// Get Logged-In User Data
app.get("/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ email: req.user.email, displayName: req.user.displayName, image: req.user.image });
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
});

// Logout Route
app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }

        // Destroy session and clear all cookies
        req.session.destroy(() => {
            res.clearCookie("connect.sid", { path: "/" }); // Clear session cookie
            res.redirect("https://accounts.google.com/logout"); // Redirect to Google logout
        });
    });
});



// Invoice Routes
app.use("/api/invoices", invoiceRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
