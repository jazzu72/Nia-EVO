const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "metrics.json");

function load() {
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function pct(a, b) {
  return b > 0 ? Number(((a / b) * 100).toFixed(2)) : 0;
}

function report() {
  const m = load();
  const p = m.pilot;
  const e = m.engagement;
  const c = m.commercial;
  const l = m.learning;

  return {
    version: m.version || "0.2.0",
    pilot: {
      participants: p.participants,
      activationRate: pct(p.activated, p.participants),
      firstMissionRate: pct(p.completed_first_mission, p.participants),
      coreCompletionRate: pct(p.completed_all_core_missions, p.participants),
      day7Retention: pct(p.day_7_retained, p.participants),
      day30Retention: pct(p.day_30_retained, p.participants)
    },
    engagement: {
      sessions: e.sessions,
      missionsStarted: e.missions_started,
      missionsCompleted: e.missions_completed,
      sparkCoinsAwarded: e.spark_coins_awarded,
      xpAwarded: e.xp_awarded
    },
    parent: {
      dashboardViews: m.parent.dashboard_views,
      gateAttempts: m.parent.gate_attempts,
      successfulGateAttempts: m.parent.successful_gate_attempts,
      gateSuccessRate: pct(
        m.parent.successful_gate_attempts,
        m.parent.gate_attempts
      )
    },
    commercial: {
      pilotInquiries: c.pilot_inquiries,
      paidCustomers: c.paid_customers,
      mrr: c.monthly_recurring_revenue,
      arr: c.annual_recurring_revenue,
      conversionRate: c.conversion_rate,
      arpu: c.average_revenue_per_user
    },
    learning: {
      preAssessment: l.pre_assessment_completed,
      postAssessment: l.post_assessment_completed,
      improvementRate: l.skill_improvement_rate
    }
  };
}

if (require.main === module) {
  console.log(JSON.stringify(report(), null, 2));
}

module.exports = { load, report };
