import express from "express";
import { Round } from "./Round.js";
import { sha256 } from "./hash.js";
import { xorshift32 } from "./prng.js";

const router = express.Router();

function randomHex(len = 32) {
  const chars = "abcdef0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Create Round (commit)
router.post("/commit", async (req, res) => {
  const serverSeed = randomHex(64);
  const nonce = Math.floor(Math.random() * 10000).toString();
  const commitHex = sha256(`${serverSeed}:${nonce}`);

  const round = await Round.create({ serverSeed, nonce, commitHex });
  res.json({ roundId: round._id, commitHex, nonce });
});

// Start Round
router.post("/:id/start", async (req, res) => {
  const { clientSeed, dropColumn, betCents } = req.body;
  const round = await Round.findById(req.params.id);
  if (!round) return res.status(404).json({ error: "Round not found" });

  const combinedSeed = sha256(
    `${round.serverSeed}:${clientSeed}:${round.nonce}`
  );

  const prng = xorshift32(parseInt(combinedSeed.slice(0, 8), 16));
  const rows = 12;
  let pos = 0;
  const path = [];

  for (let i = 0; i < rows; i++) {
    const rnd = prng();
    const move = rnd > 0.5 ? "R" : "L";
    path.push(move);
    if (move === "R") pos++;
  }

  const binIndex = pos;
  const payoutTable = [5, 2, 1.5, 1.2, 1, 1, 1, 1, 1.2, 1.5, 2, 5];
  const payoutMultiplier = payoutTable[binIndex] || 1;

  await Round.findByIdAndUpdate(req.params.id, {
    clientSeed,
    combinedSeed,
    rows,
    dropColumn,
    binIndex,
    payoutMultiplier,
    betCents,
    pathJson: path,
    status: "STARTED"
  });

  res.json({ roundId: round._id, binIndex, payoutMultiplier, path });
});

// Reveal Round
router.post("/:id/reveal", async (req, res) => {
  const round = await Round.findByIdAndUpdate(
    req.params.id,
    { status: "REVEALED", revealedAt: new Date() },
    { new: true }
  );
  res.json({ serverSeed: round.serverSeed });
});

// Verify endpoint
router.get("/verify", async (req, res) => {
  const { serverSeed, clientSeed, nonce, dropColumn } = req.query;
  const commitHex = sha256(`${serverSeed}:${nonce}`);
  const combinedSeed = sha256(`${serverSeed}:${clientSeed}:${nonce}`);
  const prng = xorshift32(parseInt(combinedSeed.slice(0, 8), 16));

  let pos = 0;
  for (let i = 0; i < 12; i++) if (prng() > 0.5) pos++;

  res.json({
    commitHex,
    combinedSeed,
    binIndex: pos,
    verified: true
  });
});

export default router;
