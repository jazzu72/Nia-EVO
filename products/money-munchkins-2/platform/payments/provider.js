const crypto = require("crypto");

function getProvider() {
  const provider = process.env.PAYMENT_PROVIDER || "manual";

  if (provider === "stripe") {
    return {
      name: "stripe",
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      createCheckout: async ({ customerId, priceId, successUrl, cancelUrl }) => {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
        }

        const Stripe = require("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        return stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [{ price: priceId, quantity: 1 }],
          metadata: { customerId },
          success_url: successUrl,
          cancel_url: cancelUrl
        });
      }
    };
  }

  return {
    name: "manual",
    configured: false,
    createCheckout: async () => {
      throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
    }
  };
}

function webhookId() {
  return crypto.randomUUID();
}

module.exports = { getProvider, webhookId };
