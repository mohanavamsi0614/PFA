import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://vamsi:vamsi@cluster0.ppyv6cx.mongodb.net");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
    process.exit(1);
  }
}
