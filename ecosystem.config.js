// ecosystem.config.js
// ╔══════════════════════════════════════════════════════════════╗
// ║  NIA-EVO  ·  PM2 Ecosystem  ·  Institutional Deployment     ║
// ║  Node 23505-Sovereign  ·  House of Jazzu                     ║
// ╚══════════════════════════════════════════════════════════════╝

module.exports = {
  apps: [
    {
      // ── Core API ───────────────────────────────────────────────
      name:             "nia-evo",
      script:           "./apps/api/server.js",
      cwd:              "/opt/nia-evo",

      // ── Clustering: use all CPU cores for horizontal scale ─────
      instances:        "max",            // one process per vCPU
      exec_mode:        "cluster",        // shared port, load-balanced

      // ── Environment ────────────────────────────────────────────
      env: {
        NODE_ENV:  "development",
        PORT:      4000,
      },
      env_staging: {
        NODE_ENV:  "staging",
        PORT:      4000,
        LOG_LEVEL: "debug",
      },
      env_production: {
        NODE_ENV:  "production",
        PORT:      4000,
        LOG_LEVEL: "warn",
      },

      // ── Restart policy ─────────────────────────────────────────
      restart_delay:    3000,             // wait 3s before restart
      max_restarts:     10,               // hard cap — alert after this
      min_uptime:       "10s",            // must stay up 10s to count as stable
      exp_backoff_restart_delay: 1000,    // exponential backoff on crash loop

      // ── Memory management ──────────────────────────────────────
      max_memory_restart: "512M",         // restart if RSS exceeds 512MB

      // ── Logging ────────────────────────────────────────────────
      log_date_format:  "YYYY-MM-DD HH:mm:ss.SSS Z",
      out_file:         "/var/log/nia-evo/api-out.log",
      error_file:       "/var/log/nia-evo/api-error.log",
      merge_logs:       true,             // single log across cluster workers

      // ── Graceful shutdown ──────────────────────────────────────
      kill_timeout:     8000,             // 8s to drain before SIGKILL
      wait_ready:       true,             // wait for process.send('ready')
      listen_timeout:   10000,

      // ── Monitoring ─────────────────────────────────────────────
      pmx:              true,

      // ── Source watching (dev only — disabled in production) ────
      watch:            false,
      ignore_watch:     ["node_modules", "logs", ".git", "*.log"],

      // ── Health check script (pm2 calls this every 30s) ─────────
      // Requires: npm install -g pm2-health
      post_update: ["npm install --legacy-peer-deps --omit=dev"],
    },

    // ── Health monitor sidecar ─────────────────────────────────────
    {
      name:      "nia-monitor",
      script:    "./scripts/monitor.js",
      cwd:       "/opt/nia-evo",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV:     "production",
        MONITOR_PORT: 4001,
        API_PORT:     4000,
      },
      env_production: {
        NODE_ENV:     "production",
        MONITOR_PORT: 4001,
        API_PORT:     4000,
        LOG_LEVEL:    "warn",
      },
      restart_delay:      5000,
      max_restarts:       5,
      log_date_format:    "YYYY-MM-DD HH:mm:ss.SSS Z",
      out_file:           "/var/log/nia-evo/monitor-out.log",
      error_file:         "/var/log/nia-evo/monitor-error.log",
      merge_logs:         true,
    },
  ],
};
