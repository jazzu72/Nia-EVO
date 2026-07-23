const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
const jobs = [
  { id: 1, title: 'Senior Software Engineer', company: 'TechCorp', location: 'Remote', salary: 150000 },
  { id: 2, title: 'Product Manager', company: 'StartupX', location: 'Austin, TX', salary: 120000 },
];

app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.get('/health', (req, res) => {
  res.json({ status: 'online', service: 'Nia Career Engine', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧠 Nia Career Engine running on port ${PORT}`);
});
