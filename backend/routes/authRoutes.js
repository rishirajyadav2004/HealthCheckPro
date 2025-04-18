const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Otp = require("../models/Otp");
const questions = require("../data/questions.json");
const UserProgress = require("../models/UserProgress");



const router = express.Router();



// ✅ Test Route
router.get("/test", (req, res) => {
    res.json({ message: "✅ API is working!" });
});



// router.post("/save-progress", async (req, res) => {

    
//     try {
//       const { userId, category, questionId, selectedOption, points } = req.body;
  
//       let progress = await UserProgress.findOne({ userId, category });
  
//       if (!progress) {
//         progress = new UserProgress({
//           userId,
//           category,
//           completedQuestions: [],
//           score: 0,
//           completed: false,
//         });
//       }
  
//       if (!progress.completedQuestions.some(q => q.questionId === questionId)) {
//         progress.completedQuestions.push({ questionId, selectedOption, points });
//         progress.score += points;
//       }
  
//       if (progress.completedQuestions.length === 5) {
//         progress.completed = true;
//       }
  
//       await progress.save();
//       res.json({ success: true, progress });
  
//     } catch (error) {
//       console.error("Error saving progress:", error);
//       res.status(500).json({ success: false, error: error.message });
//     }
//   });


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

        console.log("Attempting to send email to:", email);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes.`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response); // Log the SMTP response
        
        res.json({ message: "✅ OTP sent successfully!" });
    } catch (error) {
        console.error("❌ Full error sending OTP:", {
            message: error.message,
            stack: error.stack,
            emailConfig: {
                user: process.env.EMAIL_USER ? "Exists" : "Missing",
                service: "gmail"
            }
        });
        res.status(500).json({ 
            message: "❌ Error sending OTP",
            error: process.env.NODE_ENV === "development" ? error.message : null
        });
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

router.post("/register", async (req, res) => {
    const { name, age, gender, username, email, password, confirmPassword } = req.body;

    if (!name || !age || !gender || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "⚠ All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "❌ Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "⚠ Email already exists" });
        }

        console.log("🔹 Raw Password Before Hashing:", password);

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔹 Hashed Password Before Storing:", hashedPassword);

        const newUser = new User({ name, age, gender, username, email, password: hashedPassword });
        await newUser.save();

        console.log("✅ User registered successfully!");
        res.status(201).json({ message: "✅ User registered successfully" });

    } catch (err) {
        console.error("❌ Error in registration:", err);
        res.status(500).json({ message: "❌ Internal server error" });
    }
});


// In your login route (backend/routes/authRoutes.js)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id }, // Use the MongoDB _id
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                id: user._id, // Send the ObjectId
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});



// Forgot Password - Send Reset Link
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User with this email does not exist." });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link is valid for 1 hour.</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset link sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});


// Reset Password
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,15}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: "Password must be 6-15 characters, include uppercase, lowercase, number, and special character." 
            });
        }

        // Let Mongoose pre-save hook handle the hashing
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ message: "Invalid or expired token." });
    }
});

  

// // Get questions for a specific category
// router.get("/questions/:category", (req, res) => {
//     const { category } = req.params;
//     res.json(questions[category] || []);
//   });
  

//   // Get user progress
//   router.get("/progress/:userId", async (req, res) => {
//     const { userId } = req.params;
//     const progress = await UserProgress.find({ userId });
//     res.json(progress);
//   });

module.exports = router;
