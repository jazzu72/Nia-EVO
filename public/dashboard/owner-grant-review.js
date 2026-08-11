async function loadOwnerGrantReview() {
  const box = document.getElementById("owner-grant-review");
  if (!box) return;

  try {
    const res = await fetch("/api/owner/grant-drafts");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const drafts = Array.isArray(data.drafts) ? data.drafts : [];

    box.innerHTML = `
      <div class="owner-grant-header">
        <div>
          <h2>🏰 Owner Grant Review</h2>
          <p>
            NIA prepares the paperwork. You retain approval, signature,
            and submission authority.
          </p>
        </div>

        <span class="owner-lock">
          🔒 OWNER CONTROLLED
        </span>
      </div>

      <div class="owner-controls">
        <span>📝 Preparation: <b>ENABLED</b></span>
        <span>✍️ Signature: <b>BLOCKED</b></span>
        <span>🚀 Submission: <b>BLOCKED</b></span>
        <span>💰 Money Movement: <b>BLOCKED</b></span>
      </div>

      ${
        drafts.length
          ? drafts.map((draft, index) => {
              const opportunity = draft.opportunity || {};
              const application = draft.application || {};

              return `
                <div class="owner-grant-card">
                  <div class="owner-grant-card-header">
                    <div>
                      <h3>
                        ${escapeOwnerGrant(opportunity.title || "Funding Opportunity")}
                      </h3>

                      <small>
                        ${escapeOwnerGrant(opportunity.agency || "Agency not specified")}
                      </small>
                    </div>

                    <span class="draft-status">
                      DRAFT READY
                    </span>
                  </div>

                  <div class="owner-grant-fields">

                    <label>
                      Executive Summary
                      <textarea
                        data-field="executiveSummary"
                        data-index="${index}"
                        placeholder="NIA-prepared executive summary..."
                      >${escapeOwnerGrant(application.executiveSummary || "")}</textarea>
                    </label>

                    <label>
                      Project Description
                      <textarea
                        data-field="projectDescription"
                        data-index="${index}"
                        placeholder="Describe the proposed project..."
                      >${escapeOwnerGrant(application.projectDescription || "")}</textarea>
                    </label>

                    <label>
                      Innovation
                      <textarea
                        data-field="innovation"
                        data-index="${index}"
                        placeholder="Describe the innovation..."
                      >${escapeOwnerGrant(application.innovation || "")}</textarea>
                    </label>

                    <label>
                      Business Need
                      <textarea
                        data-field="businessNeed"
                        data-index="${index}"
                        placeholder="Describe the business need..."
                      >${escapeOwnerGrant(application.businessNeed || "")}</textarea>
                    </label>

                    <label>
                      Commercialization Plan
                      <textarea
                        data-field="commercializationPlan"
                        data-index="${index}"
                        placeholder="Describe commercialization..."
                      >${escapeOwnerGrant(application.commercializationPlan || "")}</textarea>
                    </label>

                    <label>
                      Milestones
                      <textarea
                        data-field="milestones"
                        data-index="${index}"
                        placeholder="List milestones..."
                      >${escapeOwnerGrant(application.milestones || "")}</textarea>
                    </label>

                    <label>
                      Budget Narrative
                      <textarea
                        data-field="budgetNarrative"
                        data-index="${index}"
                        placeholder="Describe the proposed budget..."
                      >${escapeOwnerGrant(application.budgetNarrative || "")}</textarea>
                    </label>

                  </div>

                  <div class="owner-grant-actions">
                    <button
                      class="button primary"
                      type="button"
                      onclick="saveOwnerGrantDraft(${index})"
                    >
                      💾 Save Draft
                    </button>

                    <button
                      class="button secondary"
                      type="button"
                      disabled
                      title="Owner signature is required"
                    >
                      ✍️ Sign — Owner Only
                    </button>

                    <button
                      class="button secondary"
                      type="button"
                      disabled
                      title="Owner approval and signature are required"
                    >
                      🚀 Submit — Owner Only
                    </button>
                  </div>

                  <div class="owner-notice">
                    🔐 NIA cannot sign, approve, submit, execute financial
                    transactions, or move funds from this interface.
                  </div>
                </div>
              `;
            }).join("")
          : `
            <div class="owner-empty">
              No grant drafts are currently available.
            </div>
          `
      }
    `;
  } catch (err) {
    console.error("Owner grant review error:", err);

    box.innerHTML = `
      <div class="owner-error">
        ⚠️ Unable to load owner grant drafts.
        <small>${escapeOwnerGrant(err.message)}</small>
      </div>
    `;
  }
}

function escapeOwnerGrant(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function saveOwnerGrantDraft(index) {
  const fields = document.querySelectorAll(
    `[data-index="${index}"][data-field]`
  );

  const draft = {};

  fields.forEach(field => {
    draft[field.dataset.field] = field.value;
  });

  try {
    const dataRes = await fetch("/api/owner/grant-drafts");
    const data = await dataRes.json();

    if (!dataRes.ok || !Array.isArray(data.drafts)) {
      throw new Error("Unable to load draft records");
    }

    const target = data.drafts[index];

    if (!target || !target.draftId) {
      throw new Error("Draft not found");
    }

    const saveRes = await fetch(
      "/api/owner/grant-drafts/" +
      encodeURIComponent(target.draftId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(draft)
      }
    );

    const result = await saveRes.json();

    if (!saveRes.ok || result.ok !== true) {
      throw new Error(result.error || "Draft save failed");
    }

    alert(
      "Grant draft saved successfully. " +
      "Owner approval, signature, and submission are still required."
    );

  } catch (err) {
    console.error("Owner draft save error:", err);
    alert("Unable to save grant draft: " + err.message);
  }
}

loadOwnerGrantReview();

setInterval(loadOwnerGrantReview, 60000);
