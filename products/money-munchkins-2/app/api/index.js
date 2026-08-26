const express = require("express");
const missions = require("../../content/missions/missions.json");
const characters = require("../../content/characters/characters.json");
const cards = require("../../content/cards/cards.json");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    product: "money-munchkins-quantum-odyssey",
    status: "operational"
  });
});

router.get("/missions", (req, res) => {
  res.json({ success: true, missions });
});

router.get("/missions/:id", (req, res) => {
  const mission = missions.find(m => m.id === req.params.id);

  if (!mission) {
    return res.status(404).json({
      success: false,
      error: "MISSION_NOT_FOUND"
    });
  }

  res.json({ success: true, mission });
});

router.get("/characters", (req, res) => {
  res.json({ success: true, characters });
});

router.get("/cards", (req, res) => {
  res.json({ success: true, cards });
});

module.exports = router;
