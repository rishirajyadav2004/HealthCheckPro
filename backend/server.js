const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const express = require("express");
const fs = require("fs");


// Initialize express app first
const app = express();

// Load environment variables
dotenv.config();

// Middleware setup
app.use(express.json());

const allowedOrigins = [
  'https://health-check-pro.vercel.app/', // Your deployed frontend URL
  'http://localhost:3000'                     // Local dev
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Your existing routes
app.get('/api/data', (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Database models
const Otp = require("./models/Otp");
const User = require("./models/User");
const UserProgress = require("./models/UserProgress");

// Route imports
const userRoutes = require("./routes/userRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const assessmentHistoryRoutes = require("./routes/assessmentHistoryRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");


// Add this with your other route imports
const profileRoutes = require("./routes/ProfileRoutes");

// Add this with your other route registrations
app.use("/api/profiles", profileRoutes);
// Add this with your other middleware
app.use('/public', express.static('public'));
app.use('/uploads', express.static('public/uploads'));
// Route registration
app.use("/api/users", userRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/assessment-history", assessmentHistoryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.post('/api/auth/temp-login', (req, res) => {
  // In a real app, you would verify user credentials first
  const payload = {
    user: {
      id: 'test-user-id' // Replace with actual user ID from DB in production
    }
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallbacksecret', { expiresIn: '1h' });
  res.json({ token });
});



// Test Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Add these routes before your other routes
app.get('/api/create-demo-data', async (req, res) => {
  try {
    // Import your demo creation functions
    const { createDemoUsers } = require('./routes/leaderboardRoutes');
    const { createDemoHistories } = require('./routes/assessmentHistoryRoutes');
    
    await createDemoUsers();
    await createDemoHistories();
    
    res.json({ success: true, message: 'Demo data created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1); // Exit if DB connection fails
});
// ✅ Set up Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Might be needed in some environments
  }
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

    // Generate a reset token with user ID (not email)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log("Generated Reset Link:", resetLink);

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
    const user = await User.findById(decoded.id);

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

    // Let Mongoose handle the hashing via the pre-save hook
    user.password = newPassword;
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


// Test if backend is reachable
app.get('/api/ping', (req, res) => {
  res.json({ message: "Backend is reachable", timestamp: new Date() });
});

// Test email functionality
app.get('/api/test-email', async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "This is a test email from your backend"
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      emailConfig: {
        user: process.env.EMAIL_USER,
        service: "gmail"
      }
    });
  }
});







// Only run this if NOT in serverless (i.e., running locally)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

// ✅ Export for Vercel
module.exports = app;
