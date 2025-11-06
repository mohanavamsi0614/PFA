"use client";
import { motion } from "framer-motion";

export default function Ball({ path }: { path: ("L" | "R")[] }) {
  return (
    <motion.div
      className="absolute w-5 h-5 bg-red-500 rounded-full"
      initial={{ x: 280, y: 0 }}
      animate={{
        y: 450,
        x: path.reduce((acc, s) => acc + (s === "L" ? -25 : 25), 280)
      }}
      transition={{ duration: 3, ease: "easeInOut" }}
    />
  );
}
