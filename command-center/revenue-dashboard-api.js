const express = require("express");
const router = express.Router();

const revenue = require("../revenue/revenue-engine");

const automation = require("../revenue/automation-engine");



// NIA_REVENUE_METRICS_V1
function revenueSnapshot(req, res) {
    try {
        const deals = revenue.pipeline();
        const openStages = new Set([
            "new", "prospect", "qualified", "contacted",
            "interested", "proposal", "negotiation", "pilot_offered"
        ]);
        const terminalStages = new Set([
            "closed", "won", "lost", "archived"
        ]);

        const rows = deals.map(deal => {
            const raw = deal.value;
            if (
                (typeof raw !== "number" && typeof raw !== "string") ||
                String(raw).trim() === "" ||
                !Number.isFinite(Number(raw)) ||
                Number(raw) < 0
            ) {
                throw new Error("INVALID_REVENUE_VALUE");
            }
            return {
                value: Number(raw),
                stage: String(deal.stage || "").trim().toLowerCase()
            };
        });

        const active = rows.filter(row => openStages.has(row.stage));
        const unknown = rows.filter(row =>
            !openStages.has(row.stage) &&
            !terminalStages.has(row.stage)
        );
        const pipelineValue = active.reduce((sum, row) => sum + row.value, 0);
        if (!Number.isFinite(pipelineValue)) {
            throw new Error("INVALID_REVENUE_TOTAL");
        }

        return res.json({
            ok: true,
            system: "Nia Revenue Command Center",
            status: "ONLINE",
            dataStatus: unknown.length ? "NEEDS_REVIEW" : "VALID",
            metrics: {
                totalDeals: rows.length,
                activeDeals: active.length,
                pipelineValue,
                closedDeals: rows.filter(row =>
                    row.stage === "closed" || row.stage === "won"
                ).length,
                lostDeals: rows.filter(row => row.stage === "lost").length,
                archivedDeals: rows.filter(row => row.stage === "archived").length,
                unknownStageDeals: unknown.length,
                cashCollected: null,
                timestamp: new Date().toISOString()
            },
            basis: {
                pipelineValue: "Sum of recognized open-stage deal values; not collected cash",
                cashCollected: "Not connected to verified payment records",
                unknownStages: "Excluded from active pipeline pending review"
            },
            recommendations: [],
            recommendationsStatus: "NOT_COMPUTED"
        });
    } catch (error) {
        console.error("[REVENUE_SNAPSHOT]", error.message);
        return res.status(500).json({
            ok: false,
            error: "REVENUE_DATA_UNAVAILABLE"
        });
    }
}

router.get("/pipeline", revenueSnapshot);
router.get("/revenue", revenueSnapshot);

// Revenue Automation Queue
router.get("/revenue/queue",(req,res)=>{

    if(automation && automation.queue){

        return res.json(
            automation.queue()
        );

    }


    res.json([]);

});


// Add Revenue Task
router.post("/revenue/task",(req,res)=>{


    const task={

        id:"TASK-"+Date.now(),

        type:"REVENUE",

        instruction:req.body.instruction || 
        "Find new customers",

        priority:req.body.priority || 
        "NORMAL",

        status:"pending",

        created:new Date().toISOString()

    };


    res.json({

        success:true,

        task

    });


});


module.exports = router;
