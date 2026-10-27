// NIA REVENUE ENGINE

const fs = require("fs");

const DB = require("path").resolve(__dirname, "../data/revenue/deals.json");



// NIA_REVENUE_METRICS_V1
function load() {
    if (!fs.existsSync(DB)) return [];
    const rows = JSON.parse(fs.readFileSync(DB, "utf8"));
    if (!Array.isArray(rows) || rows.some(row =>
        !row || typeof row !== "object" || Array.isArray(row)
    )) {
        throw new Error("INVALID_REVENUE_STORE");
    }
    return rows;
}


// NIA_VALIDATED_SALES_WRITE_V1
function salesError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function save(data) {
    const path = require("path");
    const crypto = require("crypto");
    fs.mkdirSync(path.dirname(DB), { recursive: true });
    const temp = DB + ".tmp-" + crypto.randomUUID();
    try {
        fs.writeFileSync(temp, JSON.stringify(data, null, 2), {
            mode: 0o600,
            flag: "wx"
        });
        fs.renameSync(temp, DB);
    } finally {
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
    }
}

function addDeal(deal) {
    if (!deal || typeof deal !== "object" || Array.isArray(deal)) {
        throw salesError("DEAL_REQUIRED", 400);
    }

    const required = [
        "requestId", "sourceId", "sourceRef",
        "company", "service", "nextAction"
    ];

    for (const key of required) {
        if (typeof deal[key] !== "string" ||
            !deal[key].trim() ||
            deal[key].length > 2000) {
            throw salesError("INVALID_FIELD_" + key, 400);
        }
    }

    if (
        (typeof deal.value !== "number" &&
         typeof deal.value !== "string") ||
        String(deal.value).trim() === "" ||
        !Number.isFinite(Number(deal.value)) ||
        Number(deal.value) < 0
    ) {
        throw salesError("INVALID_DEAL_VALUE", 400);
    }

    if (deal.contact != null &&
        (typeof deal.contact !== "string" || deal.contact.length > 1000)) {
        throw salesError("INVALID_CONTACT", 400);
    }

    const snapshot = {
        sourceId: deal.sourceId.trim(),
        sourceRef: deal.sourceRef.trim(),
        company: deal.company.trim(),
        contact: typeof deal.contact === "string" ? deal.contact.trim() : null,
        service: deal.service.trim(),
        value: Number(deal.value),
        nextAction: deal.nextAction.trim()
    };

    const crypto = require("crypto");
    const fingerprint = crypto.createHash("sha256")
        .update(JSON.stringify(snapshot)).digest("hex");
    const requestId = deal.requestId.trim();
    const deals = load();
    const existing = deals.find(row => row.requestId === requestId);

    if (existing) {
        if (existing.requestFingerprint !== fingerprint) {
            throw salesError("REQUEST_ID_CONTENT_CONFLICT", 409);
        }
        return existing;
    }

    if (deals.some(row =>
        row.sourceId === snapshot.sourceId &&
        row.sourceRef === snapshot.sourceRef
    )) {
        throw salesError("SOURCE_RECORD_ALREADY_LINKED", 409);
    }

    const item = Object.assign({}, snapshot, {
        id: "DEAL-" + crypto.randomUUID(),
        requestId,
        requestFingerprint: fingerprint,
        schemaVersion: 1,
        stage: "new",
        created: new Date().toISOString()
    });

    deals.push(item);
    save(deals);
    return item;
}

function pipeline(){

    return load();

}



function dashboard(){

    const deals = load();


    return {

        totalDeals:
        deals.length,


        pipelineValue:
        deals.reduce(
            (sum,d)=>
            sum + Number(d.value || 0),
            0
        ),


        stages:{

            new:
            deals.filter(
                d=>d.stage==="new"
            ).length,


            contacted:
            deals.filter(
                d=>d.stage==="contacted"
            ).length,


            closed:
            deals.filter(
                d=>d.stage==="closed"
            ).length

        },


        updated:
        new Date().toISOString()

    };

}



module.exports={

    addDeal,

    pipeline,

    dashboard

};
