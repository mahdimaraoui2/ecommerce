const express = require('express');
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { uploadFile } = require('../middleware/uploadfile');
require('dotenv').config();

// Configure Nodemailer transporter
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mahdi.maraoui2@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Use environment variable for security
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Register route
router.post('/register', uploadFile.single("avatar"), async (req, res) => {
    try {
        let { email, password, firstname, lastname } = req.body;
        const avatar = req.file.filename;

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send({ success: false, message: "User already exists" });
        }

        // Create a new user
        const newUser = new User({ email, password, firstname, lastname, avatar });

        // Save the user to the database
        const createdUser = await newUser.save();

        // Send confirmation email
        var mailOption = {
            from: '"Verify your email" <esps421@gmail.com>',
            to: newUser.email,
            subject: 'Verify your email',
            html: `<h2>${newUser.firstname}! Thank you for registering on our website</h2>
                   <h4>Please verify your email to proceed..</h4>
                   <a href="http://${req.headers.host}/api/users/status/edit?email=${newUser.email}">Click here</a>`
        };

        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Verification email sent to your Gmail account');
            }
        });

        return res.status(201).send({ success: true, message: "Account created successfully", user: createdUser });
    } catch (err) {
        console.log(err);
        res.status(500).send({ success: false, message: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        let user = await User.findOne({ email }).select('+password +isActive');

        if (!user) {
            return res.status(404).send({ success: false, message: "Account doesn't exist" });
        } else {
            let isCorrectPassword = await bcrypt.compare(password, user.password);
            if (isCorrectPassword) {
                delete user._doc.password; // Remove password from user object
                if (!user.isActive) {
                    return res.status(403).send({ success: false, message: 'Your account is inactive, Please contact your administrator' });
                }

                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                user.refreshToken = refreshToken; // Store refresh token in user document
                await user.save(); // Save user with refresh token

                return res.status(200).send({ success: true, user, accessToken, refreshToken });
            } else {
                return res.status(401).send({ success: false, message: "Please verify your credentials" });
            }
        }
    } catch (err) {
        return res.status(500).send({ success: false, message: err.message });
    }
});

// Access Token Generation
const generateAccessToken = (user) => {
    return jwt.sign({ iduser: user._id, role: user.role }, process.env.SECRET, { expiresIn: '60s' });
};

// Refresh Token Generation
const generateRefreshToken = (user) => {
    return jwt.sign({ iduser: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
};

// Refresh Token Route
router.post('/refresh-token', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401); // Unauthorized

    const user = await User.findOne({ refreshToken: token });
    if (!user) return res.sendStatus(403); // Forbidden

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403); // Forbidden
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    });
});

// Display the list of users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password from the response
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Toggle the isActive status of a user
router.get('/status/edit/', async (req, res) => {
    try {
        let email = req.query.email;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }
        user.isActive = !user.isActive; // Toggle the isActive status
        await user.save(); // Save the updated user
        res.status(200).send({ success: true, user });
    } catch (err) {
        return res.status(404).send({ success: false, message: err.message });
    }
});

// Example route that requires admin role
router.get('/admin', authorizeRoles('admin'), async (req, res) => {
    try {
        // Admin-specific logic here
        res.status(200).send({ message: "Welcome Admin!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;