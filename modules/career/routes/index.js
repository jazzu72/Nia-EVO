const express = require('express');
const router = express.Router();
const careerEngine = require('../career-engine');

router.get('/jobs', (req, res) => {
  res.json(careerEngine.jobMatcher.listJobs());
});

router.get('/resume', (req, res) => {
  res.json(careerEngine.memory.resume);
});

router.get('/interview', (req, res) => {
  res.json(careerEngine.interviewCoach.listInterviews());
});

router.get('/dashboard', (req, res) => {
  res.json(careerEngine.getDashboard());
});

module.exports = router;

router.post('/queue', (req, res) => {
  const { type, target, notes } = req.body;
  careerEngine.queue = careerEngine.queue || [];
  const task = { id: Date.now().toString(), type, target, notes, status: 'pending', createdAt: new Date().toISOString() };
  careerEngine.queue.push(task);
  careerEngine.persist();
  res.status(201).json(task);
});
