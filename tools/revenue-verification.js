"use strict";

// Nia Revenue Verification Engine
// Policy core only. A real provider adapter must authenticate provider evidence.
// Never treat a user-entered receipt reference as independent verification.

function amountToMinorUnits(amount) {
if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
throw new Error("Expected payment amount must be a positive number.");
}

const minor = Math.round(amount * 100);
if (Math.abs(amount * 100 - minor) > 1e-7) {
throw new Error("Payment amount must have no more than two decimal places.");
}
return minor;
}

function verifyPayment({ expectedAmount, expectedCurrency = "USD", reference, adapter } = {}) {
const expectedMinor = amountToMinorUnits(expectedAmount);

if (typeof reference !== "string" || !reference.trim()) {
throw new Error("A provider transaction reference is required.");
}

if (!adapter || typeof adapter.lookupPayment !== "function") {
throw new Error("No trusted payment-provider adapter is configured; verification denied.");
}

// Adapter must query the provider and authenticate its response.
// Do not pass a user-created receipt record as provider evidence.
const evidence = adapter.lookupPayment(reference.trim());

if (!evidence || typeof evidence !== "object") {
throw new Error("Provider returned no usable payment evidence.");
}

if (typeof evidence.provider !== "string" || !evidence.provider.trim()) {
throw new Error("Provider identity is missing.");
}
if (typeof evidence.transactionId !== "string" || !evidence.transactionId.trim()) {
throw new Error("Provider transaction ID is missing.");
}
if (evidence.signatureVerified !== true) {
throw new Error("Provider response authentication failed; verification denied.");
}
if (evidence.accountMatched !== true) {
throw new Error("Receiving account does not match the configured business account.");
}
if (!["paid", "succeeded"].includes(String(evidence.status).toLowerCase())) {
throw new Error("Provider does not confirm a successful payment.");
}
if (!Number.isSafeInteger(evidence.amountMinor) || evidence.amountMinor !== expectedMinor) {
throw new Error("Provider payment amount does not match the expected amount.");
}

const currency = String(evidence.currency || "").toUpperCase();
if (!/^[A-Z]{3}$/.test(currency) ||
currency !== String(expectedCurrency).toUpperCase()) {
throw new Error("Provider payment currency does not match the expected currency.");
}

const verifiedAt = evidence.verifiedAt;
if (typeof verifiedAt !== "string" || !Number.isFinite(Date.parse(verifiedAt))) {
throw new Error("Provider verification timestamp is missing or invalid.");
}

return Object.freeze({
status: "independently_verified",
provider: evidence.provider,
transactionId: evidence.transactionId,
amountMinor: evidence.amountMinor,
currency,
verifiedAt: new Date(verifiedAt).toISOString()
});
}

module.exports = { amountToMinorUnits, verifyPayment };
