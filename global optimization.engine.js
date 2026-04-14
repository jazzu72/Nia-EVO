// core/GlobalOptimizationEngine.js
// ╔══════════════════════════════════════════════════════════════╗
// ║  NIA-EVO  ·  Global Optimization Engine                     ║
// ║  AI learning · capital rebalancing · routing logic          ║
// ║  Runs on a scheduled loop + responds to streaming events    ║
// ╚══════════════════════════════════════════════════════════════╝
"use strict";

const eventBus      = require("../services/eventBus");
const { CHANNELS }  = eventBus;
const obs           = require("../services/observability");
const { createLogger } = require("../services/logger");
const log           = createLogger("GOE");

// ── Optimization intervals ────────────────────────────────────────
const INTERVALS = {
  CAPITAL_REBALANCE:  5  * 60 * 1000,  //  5 min
  ROUTE_TUNE:        15  * 60 * 1000,  // 15 min
  LEARNING_CYCLE:    60  * 60 * 1000,  //  1 hr
  HEALTH_BROADCAST:  30  * 1000,       // 30 sec
};

// ═══════════════════════════════════════════════════════════════════
class GlobalOptimizationEngine {
  /**
   * @param {object} opts
   * @param {object} opts.brain       - NiaBrain instance
   * @param {object} opts.streaming   - StreamingService instance
   * @param {object} opts.postgres    - PostgresService instance
   * @param {object} opts.ai          - async ai(prompt) function
   */
  constructor(opts = {}) {
    this._brain     = opts.brain     || null;
    this._streaming = opts.streaming || null;
    this._postgres  = opts.postgres  || null;
    this._ai        = opts.ai        || null;

    this._timers    = [];
    this._running   = false;
    this._cycles    = { capital: 0, routing: 0, learning: 0 };

    // Routing weights — tuned by the learning cycle
    this._routeWeights = {
      ANALYZE: 1.0, STRIKE: 1.0, FUNDING: 1.0,
      DEAL:    1.0, WHALE:  1.0, GENERAL: 1.0,
    };

    // Capital allocation thresholds — tuned by learning cycle
    this._capitalThresholds = {
      minScoreToAllocate: 60,   // Savon score minimum for auto-allocation
      maxSingleDealPct:   0.30, // max 30% of available in one deal
      reserveRatio:       0.20, // keep 20% in reserve
    };

    // Performance log (in-memory, persisted to Postgres on each cycle)
    this._perfLog   = [];
  }

  // ── Start / Stop ──────────────────────────────────────────────────

  start() {
    if (this._running) return;
    this._running = true;

    log.info("Global Optimization Engine starting");

    // Subscribe to streaming events to feed the learning loop
    this._wireEventListeners();

    // Scheduled optimization loops
    this._timers.push(setInterval(() => this._capitalRebalanceCycle(), INTERVALS.CAPITAL_REBALANCE));
    this._timers.push(setInterval(() => this._routingTuneCycle(),     INTERVALS.ROUTE_TUNE));
    this._timers.push(setInterval(() => this._learningCycle(),        INTERVALS.LEARNING_CYCLE));
    this._timers.push(setInterval(() => this._broadcastHealth(),      INTERVALS.HEALTH_BROADCAST));

    // Run immediately on start
    setTimeout(() => this._capitalRebalanceCycle(), 5000);
    setTimeout(() => this._broadcastHealth(), 2000);

    log.info("GOE loops started", { intervals: INTERVALS });
  }

  stop() {
    this._timers.forEach(t => clearInterval(t));
    this._timers = [];
    this._running = false;
    log.info("GOE stopped");
  }

  // ── Capital Rebalancing ───────────────────────────────────────────

  async _capitalRebalanceCycle() {
    this._cycles.capital++;
    const cycle = this._cycles.capital;

    try {
      if (!this._brain) return;

      const snapshot = this._brain.vault?.getSnapshot?.();
      if (!snapshot) return;

      const { balance, allocated, available } = snapshot;
      const utilizationRatio = allocated / (balance || 1);
      const reserveTarget    = balance * this._capitalThresholds.reserveRatio;

      log.debug(`Capital cycle #${cycle}`, { balance, allocated, available, utilizationRatio: utilizationRatio.toFixed(3) });

      // Update observability
      obs.syncVaultMetrics(snapshot);

      // Check: if utilization > 80%, tighten per-deal threshold
      if (utilizationRatio > 0.80) {
        this._capitalThresholds.minScoreToAllocate = Math.min(80,
          this._capitalThresholds.minScoreToAllocate + 5);
        log.warn(`High utilization ${(utilizationRatio * 100).toFixed(1)}% — raised min score to ${this._capitalThresholds.minScoreToAllocate}`);
      }

      // Check: if utilization < 30%, relax threshold to find more deals
      if (utilizationRatio < 0.30 && this._capitalThresholds.minScoreToAllocate > 60) {
        this._capitalThresholds.minScoreToAllocate = Math.max(60,
          this._capitalThresholds.minScoreToAllocate - 2);
        log.info(`Low utilization — relaxed min score to ${this._capitalThresholds.minScoreToAllocate}`);
      }

      // Broadcast rebalance event
      await this._streaming?.publish?.(
        "nia.system.optimization",
        { type: "CAPITAL_REBALANCE", cycle, snapshot, thresholds: this._capitalThresholds },
        "capital"
      );

    } catch (err) {
      log.error(`Capital cycle #${cycle} error: ${err.message}`);
    }
  }

  // ── Routing Tuning ────────────────────────────────────────────────

  async _routingTuneCycle() {
    this._cycles.routing++;
    const cycle = this._cycles.routing;

    try {
      const metrics = obs.getMetrics();
      const intents = metrics.counters;

      // Boost routing weight for high-volume intents (faster path allocation)
      let totalCalls = 0;
      const intentCounts = {};
      for (const [key, count] of Object.entries(intents)) {
        if (key.startsWith("nia_intent_count")) {
          const match = key.match(/intent="([^"]+)"/);
          if (match) { intentCounts[match[1]] = count; totalCalls += count; }
        }
      }

      if (totalCalls > 0) {
        for (const [intent, count] of Object.entries(intentCounts)) {
          // Weight = normalized frequency — high-use intents get priority
          this._routeWeights[intent] = Math.max(0.5, Math.min(2.0, (count / totalCalls) * 10));
        }
        log.debug(`Routing tuned cycle #${cycle}`, { weights: this._routeWeights });
      }

    } catch (err) {
      log.error(`Routing cycle #${cycle} error: ${err.message}`);
    }
  }

  // ── AI Learning Cycle ─────────────────────────────────────────────

  async _learningCycle() {
    this._cycles.learning++;
    const cycle = this._cycles.learning;

    try {
      log.info(`Learning cycle #${cycle} starting`);

      // Collect closed deals for score-vs-outcome analysis
      const closedDeals = this._brain?.registry?.getAllDeals?.({ stage: "CLOSED" }) || [];
      const deadDeals   = this._brain?.registry?.getAllDeals?.({ stage: "DEAD"   }) || [];
      const metrics     = obs.getMetrics();
      const vaultStmt   = this._brain?.vault?.getStatement?.();

      // Skip if not enough data
      if (closedDeals.length + deadDeals.length < 3 || !this._ai) {
        log.info(`Learning cycle #${cycle}: insufficient data (${closedDeals.length} closed, ${deadDeals.length} dead)`);
        return;
      }

      const prompt = `Analyze NIA-EVO acquisition performance for the learning cycle.

Closed deals: ${closedDeals.length}
Dead/failed deals: ${deadDeals.length}
Strike authorization count: ${metrics.counters["nia_strikes_authorized_total|"] || 0}
Trust violations: ${metrics.counters["nia_trust_violations_total|"] || 0}
AI calls: ${metrics.counters["nia_ai_calls_total|"] || 0}
Current min score threshold: ${this._capitalThresholds.minScoreToAllocate}
Vault utilization: ${vaultStmt ? ((vaultStmt.snapshot?.allocated / vaultStmt.snapshot?.balance) * 100).toFixed(1) + "%" : "unknown"}

Top 3 dead deal reasons (if available):
${deadDeals.slice(0, 3).map(d => `- ${d.id}: stage=${d.stage}, score=${d.savon_score || "N/A"}`).join("\n") || "None"}

Provide 3 specific, quantified recommendations to improve:
1. Capital allocation efficiency
2. Deal scoring accuracy  
3. Pipeline throughput

Format as JSON array: [{"area":"...","recommendation":"...","expectedImpact":"..."}]`;

      const aiResponse = await this._ai(prompt);

      let recommendations = [];
      try {
        const clean = aiResponse.replace(/```json|```/g, "").trim();
        recommendations = JSON.parse(clean);
      } catch {
        recommendations = [{ area: "AI Parse", recommendation: aiResponse.slice(0, 200), expectedImpact: "Unknown" }];
      }

      // Persist learning report
      this._perfLog.push({
        cycle,
        closedDeals: closedDeals.length,
        deadDeals:   deadDeals.length,
        recommendations,
        thresholds:  { ...this._capitalThresholds },
        routeWeights:{ ...this._routeWeights },
        ts:          new Date().toISOString(),
      });

      if (this._postgres?.ready) {
        await this._postgres.appendAudit({
          id:        `goe-learn-${cycle}-${Date.now()}`,
          operation: "LEARNING_CYCLE",
          actor:     "GlobalOptimizationEngine",
          severity:  "INFO",
          data:      { cycle, recommendations, thresholds: this._capitalThresholds },
          hash:      null,
        });
      }

      await this._streaming?.publish?.(
        "nia.system.optimization",
        { type: "LEARNING_CYCLE", cycle, recommendations, thresholds: this._capitalThresholds },
        "learning"
      );

      log.info(`Learning cycle #${cycle} complete`, { recommendations: recommendations.length });

    } catch (err) {
      log.error(`Learning cycle #${cycle} error: ${err.message}`);
    }
  }

  // ── Health Broadcast ──────────────────────────────────────────────

  async _broadcastHealth() {
    try {
      const status = this._brain?.getSystemStatus?.() || { status: "UNKNOWN" };
      obs.syncVaultMetrics(status.vault);
      obs.syncRegistryMetrics(status.registry);

      await this._streaming?.publish?.(
        "nia.system.health",
        { type: "HEALTH_BROADCAST", status, goe: { cycles: this._cycles, running: this._running } },
        "health"
      );
    } catch { /* non-critical */ }
  }

  // ── Event Listeners ───────────────────────────────────────────────

  _wireEventListeners() {
    // Count every pipeline call by intent
    eventBus.subscribe(CHANNELS.PIPELINE_COMPLETE, (d) => {
      if (d.intent) obs.metrics.inc(obs.M.INTENT_COUNT, { intent: d.intent });
      obs.metrics.inc(obs.M.PIPELINE_REQUESTS);
    });

    eventBus.subscribe(CHANNELS.PIPELINE_ERROR, () => {
      obs.metrics.inc(obs.M.PIPELINE_ERRORS);
    });

    eventBus.subscribe(CHANNELS.STRIKE_AUTHORIZED, () => {
      obs.metrics.inc(obs.M.STRIKES_AUTHORIZED);
    });

    eventBus.subscribe(CHANNELS.STRIKE_ABORTED, () => {
      obs.metrics.inc(obs.M.STRIKES_ABORTED);
    });

    eventBus.subscribe(CHANNELS.TRUST_VIOLATION, () => {
      obs.metrics.inc(obs.M.TRUST_VIOLATIONS);
    });

    eventBus.subscribe(CHANNELS.ANOMALY_DETECTED, () => {
      obs.metrics.inc(obs.M.ANOMALIES);
    });

    eventBus.subscribe(CHANNELS.AI_CALL, () => {
      obs.metrics.inc(obs.M.AI_CALLS);
    });
  }

  // ── Accessors ─────────────────────────────────────────────────────

  getThresholds()    { return { ...this._capitalThresholds }; }
  getRouteWeights()  { return { ...this._routeWeights }; }
  getPerfLog(n = 10) { return this._perfLog.slice(-n); }
  getCycles()        { return { ...this._cycles }; }
}

module.exports = { GlobalOptimizationEngine };
