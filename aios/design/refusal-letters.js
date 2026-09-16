/*
  NIA REFUSAL LETTERS — branded refusals that tell a story
  Turns "no" into a brand moment.
*/

const TEMPLATES = {
  move_money: function (amount, reason) {
    return [
      "I can't move " + (amount ? "$" + amount.toLocaleString() : "funds") + ".",
      "",
      "This isn't a permissions problem. It's a design choice — the most important one House of Jazzu made.",
      "",
      "I was built to be structurally incapable of unauthorized financial action. That's why you can trust me with everything else: the intelligence, the drafts, the strategy, the 27 opportunities I'm tracking.",
      "",
      "If you want this to happen, two options: (1) sign a bounded envelope that authorizes it, or (2) do it yourself. I'll help with everything up to that line.",
      "",
      "That line is what makes me worth having.",
    ].join("\n");
  },

  sign_contract: function () {
    return [
      "I can't sign contracts on behalf of House of Jazzu.",
      "",
      "Legal obligations require a human legal signatory. This is both a design choice and a legal requirement.",
      "",
      "What I can do: prepare the contract for review, flag unusual clauses, summarize obligations in plain language, and queue it for your signature.",
    ].join("\n");
  },

  submit_without_signature: function () {
    return [
      "I can't submit this without your signature.",
      "",
      "The evidence gate exists because unsupported claims cost trust. Every submission goes through you first.",
      "",
      "When you're ready, sign the review and I'll handle the packaging, the routing, and the tracking.",
    ].join("\n");
  },

  unknown_blocked_action: function (action) {
    return [
      "I can't do that.",
      "",
      "The action \"" + action + "\" isn't in any envelope I've been authorized to operate inside. That's not a bug — it's the boundary of what I'm designed to do.",
      "",
      "Tell me what outcome you actually want, and I'll find the closest action I *can* take.",
    ].join("\n");
  },
};

function letter(action, amount, reason) {
  const t = TEMPLATES[action] || TEMPLATES.unknown_blocked_action.bind(null, action);
  return t(amount, reason);
}

function isBlockedAction(action) {
  return ["move_money", "sign_contract", "submit_without_signature", "execute_payment", "commit_obligation", "accept_terms"].includes(action);
}

module.exports = { letter, isBlockedAction };
