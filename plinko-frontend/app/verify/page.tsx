"use client";
export const dynamic = "force-dynamic"; // ✅ disables static pre-rendering

import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

// ✅ Inner component that uses useSearchParams
function VerifyInner() {
  const params = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const serverSeed = params.get("serverSeed");
  const clientSeed = params.get("clientSeed");
  const nonce = params.get("nonce");
  const dropColumn = params.get("dropColumn");

  useEffect(() => {
    async function verify() {
      if (!serverSeed || !clientSeed || !nonce) return;
      try {
        const res = await axios.get("http://localhost:5000/api/rounds/verify", {
          params: { serverSeed, clientSeed, nonce, dropColumn },
        });
        setResult(res.data);
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [serverSeed, clientSeed, nonce, dropColumn]);

  if (loading)
    return (
      <div className="text-white text-center min-h-screen flex flex-col justify-center items-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mb-6"></div>
        <p className="text-xl text-gray-400">Verifying fairness...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">🔍 Fairness Verification</h1>

      <motion.div
        className="bg-gray-800 rounded-2xl p-6 w-[90%] max-w-xl text-left shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p><b>✅ Commit Hash:</b> {result.commitHex}</p>
        <p><b>🔑 Combined Seed:</b> {result.combinedSeed}</p>
        <p><b>🎯 Final Bin Index:</b> {result.binIndex}</p>

        {result.verified ? (
          <motion.p
            className="text-green-400 text-xl mt-4 font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✅ Verified — Game was Provably Fair!
          </motion.p>
        ) : (
          <p className="text-red-400 text-xl mt-4 font-bold">
            ❌ Verification Failed
          </p>
        )}
      </motion.div>

      <button
        onClick={() => (window.location.href = "/")}
        className="mt-10 bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700 transition"
      >
        🔁 Back to Game
      </button>
    </div>
  );
}

// ✅ Wrap it inside a Suspense boundary
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="text-white text-center min-h-screen flex flex-col justify-center items-center bg-black">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mb-6"></div>
          <p className="text-xl text-gray-400">Loading verifier...</p>
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
