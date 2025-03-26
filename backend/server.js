const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("./models/Otp");
const User = require("./models/User");
const path = require("path");
const express = require("express");



const fs = require("fs");
const assessmentRoutes = require("./routes/assessmentRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());


const router = express.Router();



app.use("/api/assessment", assessmentRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});




// ✅ Import Routes ONLY ONCE

const userRoutes = require("./routes/userRoutes");

// ✅ Use the routes

app.use("/api/users", userRoutes);

// ✅ Import Models

const UserProgress = require("./models/UserProgress");

const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Set up Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});





// Load questions from questions.json
const questionsFilePath = path.join(__dirname, "data", "questions.json");

function loadQuestions() {
  try {
    const questionsData = fs.readFileSync(questionsFilePath, "utf8");
    return JSON.parse(questionsData);
  } catch (error) {
    console.error("Error reading questions.json:", error);
    return {};
  }
}





// ✅ Send OTP Route
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "⚠ Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date(), expiresAt: Date.now() + 5 * 60 * 1000 }, // Set expiry time (5 mins)
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp} (Valid for 5 minutes)`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ OTP sent successfully to your email!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    res.status(500).json({ message: "❌ Failed to send OTP", error: error.message });
  }
});

// ✅ Verify OTP Route
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "⚠ Email and OTP are required" });

  try {
    const storedOtp = await Otp.findOne({ email });

    // Check if OTP exists and is not expired
    if (!storedOtp || storedOtp.otp.toString() !== otp.toString() || Date.now() > storedOtp.expiresAt) {
      return res.status(400).json({ message: "❌ Incorrect OTP or expired." });
    }

    await Otp.deleteOne({ email });
    res.json({ message: "✅ OTP verified successfully!" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ message: "❌ Server error while verifying OTP" });
  }
});


app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, age, gender, username, email, password, confirmPassword } = req.body;

    if (!name?.trim() || !age || !gender?.trim() || !username?.trim() || !email?.trim() || !password || !confirmPassword) {
      return res.status(400).json({ message: "⚠ All fields are required" });
    }

    if (password.length < 6 || password.length > 15) {
      return res.status(400).json({ message: "⚠ Password must be between 6 and 15 characters long" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "⚠ Password and Confirm Password must match" });
    }

    if (isNaN(age) || age < 1 || age > 120) {
      return res.status(400).json({ message: "⚠ Age must be a valid number between 1 and 120" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "⚠ Email is already registered" });
    }

    let existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "⚠ Username is already taken" });
    }

    // ✅ Create user and save without logging passwords or user details
    const newUser = new User({
      name: name.trim(),
      age,
      gender: gender.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
    });

    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully!" });

  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ message: "❌ Server error while registering user" });
  }
});








app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "⚠ Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "❌ Invalid email or password" });
    }

    // ✅ Use comparePassword method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "❌ Invalid email or password" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
});


// ✅ Forgot Password - Send Reset Link
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "⚠ Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "❌ User with this email does not exist" });
    }

    // Ensure CLIENT_URL is correctly set
    if (!process.env.CLIENT_URL) {
      return res.status(500).json({ message: "❌ Server error: CLIENT_URL is not defined" });
    }

    // Generate a reset token (valid for 10 mins)
    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Generate reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log("Generated Reset Link:", resetLink); // Debugging

    // Send reset link via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link is valid for 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Password reset link sent successfully!" });
  } catch (error) {
    console.error("❌ Error in Forgot Password:", error.message);
    res.status(500).json({ message: "❌ Something went wrong. Try again." });
  }
});







app.post("/api/auth/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    // Validate password (6-15 chars, must include uppercase, lowercase, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,15}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "❌ Password must be 6-15 characters and include uppercase, lowercase, number, and special character.",
      });
    }

    // Hash new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in MongoDB
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "✅ Password reset successful! You can now log in." });
  } catch (error) {
    console.error("❌ Reset Password Error:", error.message);
    res.status(400).json({ message: "❌ Invalid or expired reset link!" });
  }
});


app.get("/api/user/:id", async (req, res) => {
  const userId = req.params.id;

  // Validate if ID is provided and is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID format" });
  }

  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
  }
});





// API to get questions for a specific category
app.get("/api/assessment/questions/:category", (req, res) => {
  const { category } = req.params;
  const questions = loadQuestions();
  res.json(questions[category] || []);
});

// Save user responses and update progress


// Get user progress
app.get("/api/assessment/progress/:userId", async (req, res) => {
  const { userId } = req.params;
  const progress = await UserProgress.find({ userId });
  res.json(progress);
});

// Reset user progress
app.post("/api/assessment/reset-progress", async (req, res) => {
  const { userId } = req.body;
  await UserProgress.deleteMany({ userId });
  res.json({ success: true, message: "Assessment reset successfully" });
});





// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
