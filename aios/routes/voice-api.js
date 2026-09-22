const express = require("express");
const router = express.Router();
const voice = require("../design/voice-agent");

router.get("/status", async (_req, res) => {
  try {
    const cfg = await voice.getAgentConfig();
    res.json({ok:true, agent_id:voice.agentId(), name:cfg.name||"Nia Voice Agent", voice_id:cfg.conversation_config?.tts?.voice_id||null, language:cfg.conversation_config?.agent?.language||"en"});
  } catch (e) {
    res.status(500).json({ok:false, error:e.message});
  }
});

router.post("/session", async (_req, res) => {
  try {
    res.json({ok:true, signed_url:await voice.getSignedUrl(), agent_id:voice.agentId(), context:await voice.buildNiaContext(), expires_in:900});
  } catch (e) {
    res.status(500).json({ok:false, error:e.message});
  }
});

module.exports = router;
