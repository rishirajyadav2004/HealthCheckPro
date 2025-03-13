const mongoose = require("mongoose");
const Otp = require("./models/Otp");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Connected to MongoDB Atlas");

    const newOtp = new Otp({
      email: "test@example.com",
      otp: "123456"
    });

    await newOtp.save();
    console.log("✅ OTP saved successfully!");

    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
