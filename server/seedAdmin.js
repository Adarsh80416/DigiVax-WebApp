import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  try {
    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("✅ Admin already exists:", existing.email);
      process.exit();
    }

    // Don't hash password manually - let the User model's pre-save hook handle it
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@digivax.com",
      password: "Admin@123", // Plain password - will be hashed by pre-save hook
      phone: "9999999999",
      role: "admin",
      isApproved: true,
    });

    console.log("🎉 Admin created successfully:", admin.email);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
