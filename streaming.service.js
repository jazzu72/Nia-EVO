// services/streaming.service.js
// ╔══════════════════════════════════════════════════════════════╗
// ║  NIA-EVO  ·  Event Streaming  ·  Kafka + Redis Fallback     ║
// ║  Distributes pipeline events across the k8s cluster         ║
// ║  Kafka for durable event log · Redis for low-latency pub/sub ║
// ╚══════════════════════════════════════════════════════════════╝
"use strict";

const localBus = require("./eventBus");

// ── Topic definitions ─────────────────────────────────────────────
const TOPICS = {
  // Deal lifecycle
  DEAL_EVENTS:       "nia.deals.events",
  DEAL_SCORED:       "nia.deals.scored",
  DEAL_AUTHORIZED:   "nia.deals.authorized",
  DEAL_CLOSED:       "nia.deals.closed",

  // Capital
  CAPITAL_ALLOCATED: "nia.capital.allocated",
  CAPITAL_RELEASED:  "nia.capital.released",
  VAULT_ALERTS:      "nia.capital.alerts",

  // Compliance
  TRUST_VIOLATIONS:  "nia.compliance.violations",
  AUDIT_EVENTS:      "nia.compliance.audit",
  ANOMALIES:         "nia.compliance.anomalies",

  // Pipeline
  PIPELINE_RESULTS:  "nia.pipeline.results",
  STRIKE_EVENTS:     "nia.pipeline.strikes",

  // AI
  AI_REQUESTS:       "nia.ai.requests",
  AI_RESPONSES:      "nia.ai.responses",

  // System
  SYSTEM_HEALTH:     "nia.system.health",
  GLOBAL_OPT:        "nia.system.optimization",
};

// ── KafkaClient wrapper ───────────────────────────────────────────
class KafkaClient {
  constructor(brokers) {
    this._brokers  = brokers || "localhost:9092";
    this._producer = null;
    this._consumer = null;
    this._ready    = false;
    this._kafka    = null;
  }

  async connect() {
    try {
      // Dynamic require — kafka isn't always installed in Termux/dev
      const { Kafka } = require("kafkajs");
      this._kafka = new Kafka({
        clientId: "nia-evo-23505",
        brokers:  this._brokers.split(","),
        retry:    { initialRetryTime: 300, retries: 5 },
      });

      this._producer = this._kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout:     30000,
      });
      await this._producer.connect();

      this._consumer = this._kafka.consumer({
        groupId:          "nia-evo-group",
        sessionTimeout:   30000,
        heartbeatInterval: 5000,
      });
      await this._consumer.connect();

      this._ready = true;
      console.log("[KAFKA] Connected to", this._brokers);
    } catch (err) {
      console.warn("[KAFKA] Unavailable — falling back to in-process eventBus:", err.message);
      this._ready = false;
    }
  }

  async publish(topic, message, key) {
    if (!this._ready || !this._producer) return false;
    try {
      await this._producer.send({
        topic,
        messages: [{
          key:       key || `${Date.now()}`,
          value:     JSON.stringify({ ...message, _ts: Date.now(), _node: "23505-Sovereign" }),
          headers:   { source: "nia-evo", env: process.env.NODE_ENV || "development" },
          timestamp: String(Date.now()),
        }],
      });
      return true;
    } catch (err) {
      console.error("[KAFKA] Publish error:", err.message);
      return false;
    }
  }

  async subscribe(topic, handler, fromBeginning = false) {
    if (!this._ready || !this._consumer) return false;
    try {
      await this._consumer.subscribe({ topic, fromBeginning });
      await this._consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            await handler(data);
          } catch (err) {
            console.error("[KAFKA] Message handler error:", err.message);
          }
        },
      });
      return true;
    } catch (err) {
      console.error("[KAFKA] Subscribe error:", err.message);
      return false;
    }
  }

  async disconnect() {
    try {
      await this._producer?.disconnect();
      await this._consumer?.disconnect();
    } catch { /* ignore */ }
  }

  get ready() { return this._ready; }
}

// ── RedisClient wrapper ───────────────────────────────────────────
class RedisClient {
  constructor(url) {
    this._url    = url || "redis://localhost:6379";
    this._pub    = null;
    this._sub    = null;
    this._client = null;
    this._ready  = false;
  }

  async connect() {
    try {
      const { createClient } = require("redis");

      this._client = createClient({ url: this._url });
      this._pub    = this._client.duplicate();
      this._sub    = this._client.duplicate();

      await this._client.connect();
      await this._pub.connect();
      await this._sub.connect();

      this._ready = true;
      console.log("[REDIS] Connected to", this._url);
    } catch (err) {
      console.warn("[REDIS] Unavailable — falling back to in-process eventBus:", err.message);
      this._ready = false;
    }
  }

  async publish(channel, message) {
    if (!this._ready || !this._pub) return false;
    try {
      await this._pub.publish(channel, JSON.stringify(message));
      return true;
    } catch (err) {
      console.error("[REDIS] Publish error:", err.message);
      return false;
    }
  }

  async subscribe(channel, handler) {
    if (!this._ready || !this._sub) return false;
    try {
      await this._sub.subscribe(channel, (msg) => {
        try { handler(JSON.parse(msg)); }
        catch (err) { console.error("[REDIS] Message parse error:", err.message); }
      });
      return true;
    } catch (err) {
      console.error("[REDIS] Subscribe error:", err.message);
      return false;
    }
  }

  /** Cache get/set — used by DataService */
  async get(key)                  { return this._ready ? this._client?.get(key) : null; }
  async set(key, val, ttlSeconds) {
    if (!this._ready) return;
    const opts = ttlSeconds ? { EX: ttlSeconds } : {};
    return this._client?.set(key, JSON.stringify(val), opts);
  }
  async del(key)                  { return this._ready ? this._client?.del(key) : null; }

  async disconnect() {
    try {
      await this._client?.disconnect();
      await this._pub?.disconnect();
      await this._sub?.disconnect();
    } catch { /* ignore */ }
  }

  get ready() { return this._ready; }
}

// ═══════════════════════════════════════════════════════════════════
//  StreamingService — unified interface over Kafka + Redis
//  Falls back to in-process eventBus when neither is available
// ═══════════════════════════════════════════════════════════════════
class StreamingService {
  constructor() {
    this._kafka  = new KafkaClient(process.env.KAFKA_BROKERS);
    this._redis  = new RedisClient(process.env.REDIS_URL);
    this._ready  = false;
    this.TOPICS  = TOPICS;
  }

  async connect() {
    await Promise.all([this._kafka.connect(), this._redis.connect()]);
    this._ready = this._kafka.ready || this._redis.ready;

    if (!this._ready) {
      console.warn("[STREAMING] No external brokers — using in-process eventBus");
    }
    return this._ready;
  }

  /**
   * Publish an event. Priority: Kafka (durable) → Redis (fast) → localBus (fallback)
   * @param {string} topic    - TOPICS.*
   * @param {object} message
   * @param {string} [key]    - partition key (e.g. dealId)
   */
  async publish(topic, message, key) {
    const payload = { topic, ...message, _source: "nia-evo", _ts: Date.now() };

    // Kafka — durable, ordered, replayable
    if (this._kafka.ready) {
      await this._kafka.publish(topic, payload, key);
    }

    // Redis — low-latency pub/sub for real-time consumers
    if (this._redis.ready) {
      await this._redis.publish(topic, payload);
    }

    // Always fire on local bus (same-process listeners still work)
    localBus.publish(topic, payload);
  }

  /**
   * Subscribe to a topic.
   * @param {string}   topic
   * @param {function} handler  - async (message) => void
   * @param {string}   [transport] - "kafka" | "redis" | "auto"
   */
  async subscribe(topic, handler, transport = "auto") {
    if (transport === "kafka" && this._kafka.ready) {
      return this._kafka.subscribe(topic, handler);
    }
    if (transport === "redis" && this._redis.ready) {
      return this._redis.subscribe(topic, handler);
    }
    if (transport === "auto") {
      // Prefer Kafka for durable events, Redis for ephemeral
      if (this._kafka.ready) return this._kafka.subscribe(topic, handler);
      if (this._redis.ready) return this._redis.subscribe(topic, handler);
    }
    // Fallback: local bus
    localBus.subscribe(topic, handler);
  }

  /** Cache proxy (Redis) */
  async cacheGet(key)              { return this._redis.get(key); }
  async cacheSet(key, val, ttl)    { return this._redis.set(key, val, ttl); }
  async cacheDel(key)              { return this._redis.del(key); }

  getStatus() {
    return {
      kafka: this._kafka.ready,
      redis: this._redis.ready,
      localBus: true,
      mode: this._kafka.ready ? "kafka+redis" : this._redis.ready ? "redis" : "in-process",
    };
  }

  async disconnect() {
    await this._kafka.disconnect();
    await this._redis.disconnect();
  }
}

// Export singleton
const streaming = new StreamingService();
module.exports = streaming;
module.exports.StreamingService = StreamingService;
module.exports.TOPICS = TOPICS;
