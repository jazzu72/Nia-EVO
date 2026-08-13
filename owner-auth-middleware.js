const crypto = require("crypto");

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");

  if (aa.length !== bb.length) return false;

  return crypto.timingSafeEqual(aa, bb);
}

function getPresentedToken(req) {
  const authorization = req.get("authorization");

  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
  }

  const headerToken = req.get("x-nia-owner-token");

  if (headerToken) {
    return headerToken.trim();
  }

  return "";
}

function requireOwnerAuth(req, res, next) {
  const expected = process.env.NIA_OWNER_AUTH_TOKEN;

  if (!expected) {
    console.error("[OWNER_AUTH] NIA_OWNER_AUTH_TOKEN is not configured");

    return res.status(503).json({
      ok: false,
      error: "OWNER_AUTH_NOT_CONFIGURED"
    });
  }

  const presented = getPresentedToken(req);

  if (!presented || !timingSafeEqual(presented, expected)) {
    return res.status(401).json({
      ok: false,
      error: "OWNER_AUTH_REQUIRED"
    });
  }

  req.ownerAuthenticated = true;
  return next();
}

module.exports = {
  requireOwnerAuth
};
