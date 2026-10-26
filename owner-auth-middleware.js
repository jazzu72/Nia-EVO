"use strict";

const crypto = require("crypto");
const sessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const COOKIE_NAME = "nia_owner_session";

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function getPresentedToken(req) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (match) return match[1].trim();
  return (req.get("x-nia-owner-token") || "").trim();
}

function getCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) {
      return part.slice(i + 1).trim();
    }
  }
  return "";
}

function validateOwnerSession(req) {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return false;
  const expires = sessions.get(token);
  if (!expires) return false;
  if (expires <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function issueOwnerSession(req, res) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  const secure = req.secure ||
    req.get("x-forwarded-proto") === "https";
  const flags = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];
  if (secure) flags.push("Secure");
  res.append("Set-Cookie", flags.join("; "));
}

function revokeOwnerSession(req, res) {
  const token = getCookie(req, COOKIE_NAME);
  if (token) sessions.delete(token);
  res.append("Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` +
    ((req.secure || req.get("x-forwarded-proto") === "https")
      ? "; Secure" : ""));
}

function requireOwnerAuth(req, res, next) {
  const expected = process.env.NIA_OWNER_AUTH_TOKEN;
  if (!expected) {
    console.error("[OWNER_AUTH] NIA_OWNER_AUTH_TOKEN is not configured");
    return res.status(503).json({
      ok: false, error: "OWNER_AUTH_NOT_CONFIGURED"
    });
  }

  const presented = getPresentedToken(req);
  if (presented && timingSafeEqual(presented, expected)) {
    req.ownerAuthenticated = true;
    return next();
  }

  if (validateOwnerSession(req)) {
    req.ownerAuthenticated = true;
    return next();
  }

  return res.status(401).json({
    ok: false, error: "OWNER_AUTH_REQUIRED"
  });
}

module.exports = {
  requireOwnerAuth,
  timingSafeEqual,
  getPresentedToken,
  validateOwnerSession,
  issueOwnerSession,
  revokeOwnerSession
};
