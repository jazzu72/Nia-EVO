const crypto=require("crypto");

const distressKeywords = [
  "as-is", "as is", "must sell", "motivated", "urgent",
  "needs work", "fixer", "handyman", "cash only",
  "vacant", "tenant not paying", "behind on payments",
  "foreclosure", "preforeclosure", "auction", "distressed"
];

const sourceWeights = {
  Craigslist: 20,
  OfferUp: 15,
  Oodle: 10,
  Locanto: 10,
  Geebo: 10,
  Reddit: 25,
  Zillow: 5
};

const locationWeights = {
  "23504": 15,
  "23513": 10,
  "23223": 20,
  "23224": 15
};

function hashDeal(deal) {
  return crypto.createHash("sha256")
    .update((deal.title || "") + (deal.link || ""))
    .digest("hex");
}

function scoreDeal(deal) {
  let score = 0;
  const tags = [];
  let reasonParts = [];

  const text = `${deal.title} ${deal.description}`.toLowerCase();

  let distressHits = 0;
  for (const word of distressKeywords) {
    if (text.includes(word)) distressHits++;
  }
  const distressScore = Math.min(distressHits * 10, 40);
  if (distressScore > 0) tags.push("distressed");
  if (distressScore > 0) reasonParts.push(`distress signals x${distressHits}`);
  score += distressScore;

  const sourceScore = sourceWeights[deal.source] || 5;
  score += sourceScore;
  reasonParts.push(`source=${deal.source}`);

  if (deal.zip && locationWeights[deal.zip]) {
    score += locationWeights[deal.zip];
    tags.push("good_zip");
    reasonParts.push(`zip=${deal.zip}`);
  }

  if (deal.price && deal.avm && deal.avm > 0) {
    const discount = (deal.avm - deal.price) / deal.avm;
    const discountScore = Math.min(Math.max(discount * 100, 0), 40);
    score += discountScore;

    if (discountScore > 0) {
      tags.push("under_market");
      reasonParts.push(`discount=${Math.round(discount * 100)}%`);
    }
  }

  score = Math.max(0, Math.min(score, 100));

  return {
    ...deal,
    score,
    confidence: score / 100,
    tags,
    reason: reasonParts.join(", ")
  };
}


module.exports={hashDeal};
