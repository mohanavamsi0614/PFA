"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [roundId, setRoundId] = useState("");
  const [clientSeed, setClientSeed] = useState("vamsi123");
  const [dropColumn, setDropColumn] = useState(6);
  const [nonce, setNonce] = useState("");
  const [path, setPath] = useState<("L" | "R")[]>([]);
  const [bin, setBin] = useState<number | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [status, setStatus] = useState("Waiting for round creation...");

  // ✅ Create Round
  async function createRound() {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/rounds/commit");
      setRoundId(res.data.roundId);
      setNonce(res.data.nonce);
      toast.success("✅ Round Created Successfully!");
      setStatus("Round created. Ready to start.");
    } catch (err) {
      toast.error("❌ Failed to create round!");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Start Round
  async function startRound() {
    if (!roundId) return toast("Please create a round first!");
    try {
      setLoading(true);
      setStatus("Dropping ball...");
      const res = await axios.post(
        `http://localhost:5000/api/rounds/${roundId}/start`,
        { clientSeed, dropColumn, betCents: 100 }
      );
      setPath(res.data.path);
      setBin(res.data.binIndex);
      setIsDropping(true);

      setTimeout(() => {
        setShowConfetti(true);
        toast.success(`🎯 Ball Landed in Bin ${res.data.binIndex}!`);
        setStatus(`Ball landed in bin ${res.data.binIndex}`);
      }, 3000);
    } catch (err) {
      toast.error("Error dropping ball!");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Reveal Round → Redirect to /verify
  async function revealRound() {
    if (!roundId) return toast("Create a round first!");
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:5000/api/rounds/${roundId}/reveal`
      );
      const serverSeed = res.data.serverSeed;

      toast.success("🔐 Server Seed Revealed!");
      setStatus("Redirecting to Verifier...");

      // Redirect directly to /verify
      setTimeout(() => {
        router.push(
          `/verify?serverSeed=${serverSeed}&clientSeed=${clientSeed}&nonce=${nonce}&dropColumn=${dropColumn}`
        );
      }, 1500);
    } catch (err) {
      toast.error("Error revealing round!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-white bg-gradient-to-b from-gray-900 to-black min-h-screen flex flex-col items-center pt-10 relative overflow-hidden">
      <Toaster position="top-right" />
      {showConfetti && <Confetti recycle={false} />}

      <h1 className="text-4xl font-extrabold mb-6 tracking-wide">
        🎮 Plinko Fair Game
      </h1>

      {/* Control Panel */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-[90%] max-w-xl mb-10">
        <div className="flex flex-col gap-3">
          <label className="text-gray-400">Client Seed</label>
          <input
            value={clientSeed}
            onChange={(e) => setClientSeed(e.target.value)}
            className="text-black px-3 py-2 rounded-md focus:ring-2 ring-red-500"
          />

          <label className="text-gray-400">Drop Column (0 - 12)</label>
          <input
            type="number"
            min="0"
            max="12"
            value={dropColumn}
            onChange={(e) => setDropColumn(Number(e.target.value))}
            className="text-black px-3 py-2 rounded-md focus:ring-2 ring-red-500"
          />

          <div className="flex gap-4 mt-4 justify-center">
            <button
              disabled={loading}
              onClick={createRound}
              className={`px-4 py-2 rounded-md font-bold transition ${
                loading
                  ? "bg-gray-500"
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/40"
              }`}
            >
              {loading ? "⏳ Creating..." : "1️⃣ Create Round"}
            </button>

            <button
              disabled={loading || !roundId}
              onClick={startRound}
              className={`px-4 py-2 rounded-md font-bold transition ${
                loading
                  ? "bg-gray-500"
                  : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/40"
              }`}
            >
              {loading ? "⚙️ Processing..." : "2️⃣ Drop Ball"}
            </button>

            <button
              disabled={loading || !roundId}
              onClick={revealRound}
              className={`px-4 py-2 rounded-md font-bold transition ${
                loading
                  ? "bg-gray-500"
                  : "bg-yellow-600 hover:bg-yellow-700 shadow-lg shadow-yellow-500/40"
              }`}
            >
              3️⃣ Reveal Seed
            </button>
          </div>

          {/* Status Display */}
          <div className="mt-4 bg-black/40 border border-gray-700 p-3 rounded-md text-sm">
            <p className="text-gray-400 font-semibold">🎯 Status:</p>
            <p className="text-white">{status}</p>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-[600px] h-[500px]">
        {/* Pegs */}
        {Array.from({ length: 12 }, (_, row) => (
          <div
            key={row}
            className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-5"
            style={{ top: `${row * 40}px` }}
          >
            {Array.from({ length: row + 1 }, (_, col) => (
              <div
                key={col}
                className="w-3 h-3 bg-gray-200 rounded-full shadow shadow-gray-400"
              ></div>
            ))}
          </div>
        ))}

        {/* Bins */}
        <div className="absolute bottom-0 flex justify-between w-full px-8">
          {Array.from({ length: 13 }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 text-center rounded-md font-bold ${
                bin === i
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Ball */}
        {isDropping && (
          <motion.div
            initial={{ x: 300, y: 0 }}
            animate={{
              y: 440,
              x: path.reduce((acc, p) => acc + (p === "L" ? -25 : 25), 300),
            }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute w-6 h-6 bg-red-600 rounded-full shadow-lg shadow-red-500/50"
          />
        )}
      </div>

      {bin !== null && (
        <motion.h2
          className="text-2xl mt-8 font-semibold text-green-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🎉 Landed in Bin {bin}
        </motion.h2>
      )}
    </div>
  );
}
