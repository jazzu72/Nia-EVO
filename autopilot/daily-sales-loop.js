const axios = require("axios");

const BASE = "http://localhost:3000";

async function run() {

    console.log("🏰 NIA DAILY SALES LOOP");

    try {

        const briefing =
            await axios.get(`${BASE}/api/briefing`);

        console.log("📊 Briefing Ready");

        const queue =
            await axios.get(`${BASE}/api/revenue/automation/queue`);

        console.log(
            "📋 Pending Tasks:",
            queue.data.length
        );

        const operator =
            await axios.get(`${BASE}/api/operator/daily`);

        console.log(
            "🤖 Recommended:",
            operator.data.recommendedActions
        );

        console.log("✅ Daily Sales Loop Complete");

    } catch(err) {

        console.log(err.message);

    }

}

run();
