"use strict";

const fs = require("node:fs");
const path = require("node:path");

function createVerificationStore(options = {}) {
  const dealsFile = options.dealsFile || path.resolve("data/realestate/deals.json");
  const auditFile = options.auditFile || path.resolve("data/realestate/verification-audit.jsonl");
  const now = options.now || (() => new Date());

  function readDeals() {
    const data = JSON.parse(fs.readFileSync(dealsFile, "utf8"));
    if (!data || !Array.isArray(data.deals)) {
      throw new Error("REAL_ESTATE_DATA_INVALID");
    }
    return data;
  }

  function validateEvidence(evidence) {
    if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
      throw new Error("EVIDENCE_REQUIRED");
    }

    let source;
    try {
      source = new URL(evidence.sourceUrl);
    } catch {
      throw new Error("EVIDENCE_URL_INVALID");
    }

    if (!["http:", "https:"].includes(source.protocol) || !source.hostname) {
      throw new Error("EVIDENCE_URL_INVALID");
    }

    if (typeof evidence.description !== "string" ||
        evidence.description.trim().length < 10 ||
        evidence.description.trim().length > 2000) {
      throw new Error("EVIDENCE_DESCRIPTION_INVALID");
    }

    if (typeof evidence.checkedAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(evidence.checkedAt)) {
      throw new Error("EVIDENCE_DATE_INVALID");
    }

    const parsedDate = new Date(evidence.checkedAt + "T00:00:00.000Z");
    if (Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== evidence.checkedAt ||
        evidence.checkedAt > now().toISOString().slice(0, 10)) {
      throw new Error("EVIDENCE_DATE_INVALID");
    }

    if (evidence.ownerAttested !== true) {
      throw new Error("OWNER_ATTESTATION_REQUIRED");
    }

    return {
      sourceUrl: source.href,
      description: evidence.description.trim(),
      checkedAt: evidence.checkedAt
    };
  }

  function atomicWrite(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = file + ".tmp-" + process.pid + "-" + Math.random().toString(16).slice(2);
    try {
      fs.writeFileSync(temp, content, { flag: "wx", mode: 0o600 });
      fs.renameSync(temp, file);
    } finally {
      try { fs.unlinkSync(temp); } catch {}
    }
  }

  function recordDecision(event) {
    fs.mkdirSync(path.dirname(auditFile), { recursive: true });
    fs.appendFileSync(auditFile, JSON.stringify(event) + "\n", {
      encoding: "utf8",
      mode: 0o600
    });
  }

  function changeStatus(dealId, action, evidence, actor, authMethod = "unspecified") {
    if (typeof dealId !== "string" || !dealId.trim() || dealId.length > 200) {
      throw new Error("DEAL_ID_INVALID");
    }

    if (typeof actor !== "string" || !actor.trim() || actor.length > 200) {
      throw new Error("OWNER_ACTOR_REQUIRED");
    }

    const checkedEvidence = action === "VERIFY"
      ? validateEvidence(evidence)
      : null;

    const original = fs.readFileSync(dealsFile, "utf8");
    const data = readDeals();
    const deal = data.deals.find(item => item && item.id === dealId);

    if (!deal) throw new Error("DEAL_NOT_FOUND");

    if (action === "VERIFY") {
      const classification = typeof deal.dataClassification === "string"
        ? deal.dataClassification.trim() : "";
      const eligibleClassifications = new Set([
        "USER_SUBMITTED",
        "UNVERIFIED_USER_SUBMITTED"
      ]);
      if (!eligibleClassifications.has(classification)) {
        if (classification === "DEMO_UNVERIFIED") {
          throw new Error("DEMO_RECORD_CANNOT_BE_VERIFIED");
        }
        throw new Error("DEAL_CLASSIFICATION_NOT_ELIGIBLE");
      }
    }

    const previousStatus = deal.verificationStatus || "UNVERIFIED";
    const newStatus = action === "VERIFY" ? "VERIFIED" : "UNVERIFIED";

    if (action === "VERIFY" && previousStatus === "VERIFIED") {
      throw new Error("DEAL_ALREADY_VERIFIED");
    }

    if (action === "REVOKE" && previousStatus !== "VERIFIED") {
      throw new Error("DEAL_NOT_VERIFIED");
    }

    const timestamp = now().toISOString();
    const oldDeal = { ...deal };

    deal.verificationStatus = newStatus;
    deal.verificationUpdatedAt = timestamp;
    deal.verificationUpdatedBy = actor.trim();

    if (action === "VERIFY") {
      deal.verificationEvidence = checkedEvidence;
      delete deal.verificationRevokedAt;
    } else {
      delete deal.verificationEvidence;
      deal.verificationRevokedAt = timestamp;
    }

    const event = {
      timestamp,
      actor: actor.trim(),
      actorTitle: "Founder",
      organization: "House of Jazzu",
      authMethod: typeof authMethod === "string" &&
        ["owner_token", "owner_session"].includes(authMethod)
        ? authMethod : "unspecified",
      dealId,
      action,
      previousStatus,
      newStatus,
      evidence: checkedEvidence
    };

    try {
      atomicWrite(dealsFile, JSON.stringify(data, null, 2) + "\n");
      recordDecision(event);
    } catch (error) {
      try {
        atomicWrite(dealsFile, original);
      } catch (rollbackError) {
        error.message += "; DEAL_ROLLBACK_FAILED: " + rollbackError.message;
      }

      Object.assign(deal, oldDeal);
      throw error;
    }

    return {
      ok: true,
      dealId,
      verificationStatus: newStatus,
      verificationUpdatedAt: timestamp
    };
  }

  return {
    verify(dealId, evidence, actor, authMethod) {
      return changeStatus(dealId, "VERIFY", evidence, actor, authMethod);
    },
    revoke(dealId, actor, authMethod) {
      return changeStatus(dealId, "REVOKE", null, actor, authMethod);
    }
  };
}

module.exports = { createVerificationStore };
