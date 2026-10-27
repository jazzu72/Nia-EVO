const fs = require("fs");
const crypto = require("crypto");

const DRAFT_DB = "data/revenue/outreach-drafts.json";
const EXEC_DB = "data/revenue/outreach-executions.json";
const ACTION_DB = "data/revenue/actions.json";

function ensureDB() {
    fs.mkdirSync("data/revenue", { recursive: true });

    if (!fs.existsSync(EXEC_DB)) {
        fs.writeFileSync(EXEC_DB, "[]");
    }
}

function loadDrafts() {
    return JSON.parse(
        fs.readFileSync(DRAFT_DB, "utf8")
    );
}

function loadExecutions() {
    ensureDB();

    return JSON.parse(
        fs.readFileSync(EXEC_DB, "utf8")
    );
}

function saveExecutions(data) {
    fs.writeFileSync(
        EXEC_DB,
        JSON.stringify(data, null, 2)
    );
}

function syncAction(actionId, executionId) {

    if (!fs.existsSync(ACTION_DB)) {
        return;
    }

    const actions =
        JSON.parse(
            fs.readFileSync(ACTION_DB, "utf8")
        );

    const action =
        actions.find(
            a => a.id === actionId
        );

    if (!action) {
        return;
    }

    if (action.status === "QUEUED") {
        action.status = "EXECUTION_READY";
        action.executionId = executionId;
        action.executionReadyAt =
            new Date().toISOString();

        fs.writeFileSync(
            ACTION_DB,
            JSON.stringify(actions, null, 2)
        );
    }
}

function makeId() {
    return `EXEC-${crypto.randomUUID()}`;
}

/*
 * Prepare an APPROVED draft for execution.
 *
 * DRY RUN ONLY.
 * No external message is sent.
 */
function prepare(id, channel = "email") {

    const drafts = loadDrafts();
    const executions = loadExecutions();

    const draft =
        drafts.find(d => d.id === id);

    if (!draft) {
        return {
            ok: false,
            error: "Draft not found"
        };
    }

    if (draft.status !== "APPROVED") {
        return {
            ok: false,
            error:
                `Draft must be APPROVED. Current status: ${draft.status}`
        };
    }

    const existing =
        executions.find(
            e =>
                e.draftId === draft.id &&
                e.channel === channel &&
                e.status !== "FAILED"
        );

    if (existing) {
        return {
            ok: true,
            duplicate: true,
            execution: existing
        };
    }

    if (!draft.content[channel]) {
        return {
            ok: false,
            error:
                `Channel not available: ${channel}`
        };
    }

    const execution = {

        id: makeId(),

        draftId:
            draft.id,

        actionId:
            draft.actionId,

        actionKey:
            draft.actionKey,

        prospectId:
            draft.prospectId,

        prospectKey:
            draft.prospectKey,

        company:
            draft.company,

        channel,

        mode:
            "DRY_RUN",

        status:
            "READY_TO_SEND",

        content:
            draft.content[channel],

        createdAt:
            new Date().toISOString(),

        sentAt:
            null,

        failedAt:
            null,

        error:
            null
    };

    executions.push(execution);

    saveExecutions(executions);

    syncAction(
        execution.actionId,
        execution.id
    );

    return {
        ok: true,
        created: true,
        execution
    };
}


// NIA_LEGACY_SIMULATION_VIEW_V1
function queue() {
    return loadExecutions().map(execution => {
        if (
            execution.mode === "DRY_RUN" &&
            execution.status === "SENT"
        ) {
            return Object.assign({}, execution, {
                status: "DRY_RUN_COMPLETED",
                sentAt: null,
                simulatedAt: execution.sentAt || null,
                externalExecutionPerformed: false,
                legacyRecord: {
                    status: execution.status,
                    sentAt: execution.sentAt || null,
                    interpretation: "SIMULATION_NOT_DELIVERY"
                }
            });
        }
        return execution;
    });
}

function ready() {
    return loadExecutions().filter(
        e => e.status === "READY_TO_SEND"
    );
}


// NIA_DRY_RUN_TRUTH_V1
function markDryRunSent(id) {
    const executions = loadExecutions();
    const execution = executions.find(e => e.id === id);

    if (!execution) return null;

    if (execution.mode !== "DRY_RUN") {
        throw new Error("DRY_RUN_MODE_REQUIRED");
    }

    if (execution.status === "DRY_RUN_COMPLETED") {
        return execution;
    }

    if (execution.status !== "READY_TO_SEND") {
        throw new Error("DRY_RUN_INVALID_STATE");
    }

    if (execution.sentAt != null) {
        throw new Error("DRY_RUN_HAS_DELIVERY_TIMESTAMP");
    }

    execution.status = "DRY_RUN_COMPLETED";
    execution.simulatedAt = new Date().toISOString();
    execution.sentAt = null;
    execution.externalExecutionPerformed = false;
    execution.simulation = {
        completed: true,
        externalProviderContacted: false,
        businessActionCompleted: false
    };

    saveExecutions(executions);
    return execution;
}

module.exports = {
    prepare,
    queue,
    ready,
    markDryRunSent
};
