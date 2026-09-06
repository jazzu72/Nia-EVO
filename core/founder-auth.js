module.exports = function isFounder(identity) {
  if (!identity) return false;
  return (
    identity.name === "Jason LeSane" &&
    (identity.location || "").toLowerCase().includes("norfolk")
  );
};
