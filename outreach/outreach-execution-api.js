const express = require("express");

const engine =
    require("./outreach-execution-engine");

const router = express.Router();

/*
 * Prepare an approved draft.
 *
 * This does NOT send anything externally.
 */
router.post("/prepare/:id", (req, res) => {

    try {

        const channel =
            req.body.channel || "email";

        res.json(
            engine.prepare(
                req.params.id,
                channel
            )
        );

    } catch (error) {

        console.error(
            "❌ Execution preparation failed:",
            error
        );

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

/*
 * View execution queue.
 */
router.get("/queue", (req, res) => {

    res.json({
        ok: true,
        executions:
            engine.queue()
    });

});

/*
 * View executions ready for transmission.
 */
router.get("/ready", (req, res) => {

    res.json({
        ok: true,
        executions:
            engine.ready()
    });

});

/*
 * Dry-run delivery confirmation.
 *
 * This DOES NOT contact an external provider.
 */
router.post("/dry-run/:id", (req, res) => {

    try {

        const execution =
            engine.markDryRunSent(
                req.params.id
            );

        if (!execution) {

            return res.status(404).json({
                ok: false,
                error: "Execution not found"
            });

        }

        res.json({
            ok: true,
            dryRun: true,
            execution
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }
});

module.exports = router;
