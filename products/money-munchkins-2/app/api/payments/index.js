const express = require("express");
const { getProvider } = require("../../../platform/payments/provider");

const router = express.Router();

router.get("/status", (req, res) => {
  const provider = getProvider();

  res.json({
    success: true,
    provider: provider.name,
    configured: provider.configured
  });
});

router.post("/checkout", async (req, res) => {
  try {
    const { customerId, priceId } = req.body || {};

    if (!customerId || !priceId) {
      return res.status(400).json({
        success: false,
        error: "CUSTOMER_AND_PRICE_REQUIRED"
      });
    }

    const base = process.env.PUBLIC_APP_URL;

    if (!base) {
      return res.status(500).json({
        success: false,
        error: "PUBLIC_APP_URL_NOT_CONFIGURED"
      });
    }

    const provider = getProvider();

    const session = await provider.createCheckout({
      customerId,
      priceId,
      successUrl: `${base}/money-munchkins/pilot?payment=success`,
      cancelUrl: `${base}/money-munchkins/pilot?payment=cancelled`
    });

    res.json({
      success: true,
      provider: provider.name,
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: err.message || "PAYMENT_UNAVAILABLE"
    });
  }
});

module.exports = router;
