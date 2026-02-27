const express = require("express");
const router = express.Router();
const { runAgent, runAgentDemo } = require("../services/payAgent");

// POST /api/agent/chat
router.post("/chat", async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    // Use real Claude API if key set, else demo mode
    const result = process.env.CLAUDE_API_KEY
      ? await runAgent(message, history)
      : await runAgentDemo(message);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
