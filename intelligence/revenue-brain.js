// NIA REVENUE BRAIN

function scoreDeal(deal) {

    let score = 0;

    if (Number(deal.value || 0) >= 5000) score += 30;
    if (deal.stage === "new") score += 10;
    if (deal.stage === "contacted") score += 20;
    if (deal.stage === "proposal") score += 30;
    if (deal.stage === "closed") score = 100;

    const probability = Math.min(score, 100);

    return {
        company: deal.company,
        value: deal.value,
        stage: deal.stage,
        probability,
        priority:
            probability >= 70 ? "HIGH" :
            probability >= 40 ? "MEDIUM" :
            "LOW"
    };
}

function analyzePipeline(deals) {

    const ranking = deals
        .map(scoreDeal)
        .sort((a, b) => b.probability - a.probability);

    return {
        totalDeals: deals.length,
        highPriority: ranking.filter(r => r.priority === "HIGH").length,
        estimatedRevenue: deals.reduce(
            (sum, d) => sum + Number(d.value || 0),
            0
        ),
        ranking,
        generated: new Date().toISOString()
    };
}

module.exports = {
    scoreDeal,
    analyzePipeline
};
