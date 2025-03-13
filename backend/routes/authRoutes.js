const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Otp = require("../models/Otp");

const router = express.Router();

// ✅ Test Route
router.get("/test", (req, res) => {
    res.json({ message: "✅ API is working!" });
});

// ✅ Send OTP (Valid for 5 Minutes)
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "⚠ Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

    try {
        // ✅ Store or update OTP
        await Otp.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log(`✅ OTP Generated for ${email}:`, otp);

        // ✅ Send OTP via email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "✅ OTP sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending OTP:", error);
        res.status(500).json({ message: "❌ Error sending OTP" });
    }
});

// ✅ Verify OTP
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "⚠ Email and OTP are required" });
    }

    try {
        const storedOtp = await Otp.findOne({ email });

        if (!storedOtp) {
            return res.status(400).json({ message: "❌ Invalid or expired OTP. Request a new one." });
        }

        // Check if OTP is expired (valid for 5 minutes)
        const otpExpiration = new Date(storedOtp.createdAt);
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

        if (new Date() > otpExpiration) {
            await Otp.deleteOne({ email }); // Delete expired OTP
            return res.status(400).json({ message: "❌ OTP expired. Request a new one." });
        }

        // ✅ Compare OTP correctly
        if (storedOtp.otp.toString().trim() !== otp.toString().trim()) {
            return res.status(400).json({ message: "❌ Incorrect OTP. Try again." });
        }

        // ✅ OTP verified, now remove OTP from the database
        await Otp.deleteOne({ email });

        res.json({ message: "✅ OTP verified successfully!" });
    } catch (error) {
        console.error("❌ Error verifying OTP:", error);
        res.status(500).json({ message: "❌ Server error while verifying OTP" });
    }
});

// ✅ Register User (Only after OTP Verification)
router.post("/register", async (req, res) => {
    const { name, age, gender, email, password } = req.body;

    if (!name || !age || !gender || !email || !password) {
        return res.status(400).json({ message: "⚠ All fields are required" });
    }

    try {
        // ✅ Ensure OTP was verified (OTP should not exist in DB)
        const storedOtp = await Otp.findOne({ email });

        if (storedOtp) {
            return res.status(400).json({ message: "❌ OTP not verified. Please verify your OTP first." });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "⚠ User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, age, gender, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "✅ User registered successfully" });
    } catch (err) {
        console.error("❌ Error in registration:", err);
        res.status(500).json({ message: "❌ Internal server error" });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "⚠ Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "❌ Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "❌ Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        );

        res.json({ 
            message: "✅ Login successful",
            token, 
            user: { id: user._id, name: user.name, age: user.age, gender: user.gender, email: user.email } 
        });
    } catch (err) {
        console.error("❌ Error in login:", err);
        res.status(500).json({ message: "❌ Internal server error" });
    }
});

module.exports = router;
