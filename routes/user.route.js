const express = require('express');
const router = express.Router();
const User = require("../models/User"); // Ensure the path to your User model is correct
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation

// Create a new user
router.post('/register', async (req, res) => {
    try {
        let { email, password, firstname, lastname } = req.body;

        // Check if the user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).send({ success: false, message: "User already exists" });
        }

        // Create a new user
        const newUser = new User({ email, password, firstname, lastname });

        // Save the user to the database
        const createdUser = await newUser.save();
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

        let user = await User.findOne({ email }).select('+password +isActive'); // Include password and isActive fields

        if (!user) {
            return res.status(404).send({ success: false, message: "Account doesn't exist" });
        } else {
            let isCorrectPassword = await bcrypt.compare(password, user.password);
            if (isCorrectPassword) {
                delete user._doc.password; // Remove password from user object
                if (!user.isActive) {
                    return res.status(403).send({ success: false, message: 'Your account is inactive, Please contact your administrator' });
                }

                const token = jwt.sign({ iduser: user._id, name: user.firstname, role: user.role }, process.env.SECRET, {
                    expiresIn: "1h",
                });

                return res.status(200).send({ success: true, user, token });
            } else {
                return res.status(401).send({ success: false, message: "Please verify your credentials" });
            }
        }
    } catch (err) {
        return res.status(500).send({ success: false, message: err.message });
    }
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

module.exports = router; 