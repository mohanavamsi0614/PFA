import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import roundsRouter from "./rounds.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/rounds", roundsRouter);
app.get("/", (req, res) => {
  res.send("API is running...");
});

connectDB();

app.listen(5000, () =>
  console.log(`✅ Server running on ${5500}`)
);
