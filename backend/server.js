const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // ✅ Import JWT
const Otp = require("./models/Otp"); // Import OTP model
const User = require("./models/User"); // Import User model

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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

// ✅ Route to Send OTP
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "⚠ Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
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

// ✅ Route to Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "⚠ Email and OTP are required" });

  try {
    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp || storedOtp.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "❌ Incorrect OTP or expired." });
    }
    await Otp.deleteOne({ email });
    res.json({ message: "✅ OTP verified successfully!" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ message: "❌ Server error while verifying OTP" });
  }
});

// ✅ Route to Register User
app.post("/api/auth/register", async (req, res) => {
  const { name, age, gender, email, username, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "⚠ Email and password are required" });

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "⚠ User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, age, gender, email, username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "✅ User registered successfully!" });
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ message: "❌ Server error while registering user" });
  }
});

// ✅ Route to Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "⚠ Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "❌ Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "❌ Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("❌ Error in login:", err);
    res.status(500).json({ message: "❌ Internal server error" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));