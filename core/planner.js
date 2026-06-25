const apiBrain = require("./api-brain");
const memory = require("./memory");

module.exports = {
  async generate(goal) {
    const prompt = `
Break the following goal into 3-7 clear steps.
Return ONLY a JSON array of steps.

Goal: ${goal}
    `;

    const plan = await apiBrain(prompt);
    let steps = [];

    try {
      steps = JSON.parse(plan);
    } catch {
      steps = [{ step: "Failed to parse plan" }];
    }

    memory.write("current_plan", { goal, steps, index: 0 });
    return steps;
  },

  get() {
    return memory.read("current_plan");
  },

  async executeNext() {
    const plan = memory.read("current_plan");
    if (!plan) return "NO_PLAN";

    const { steps, index } = plan;
    if (index >= steps.length) return "DONE";

    const current = steps[index];

    const result = await apiBrain(`
Execute this step logically and concisely:
${JSON.stringify(current)}
Return a short summary of what was done.
    `);

    plan.index += 1;
    memory.write("current_plan", plan);

    memory.append("plan_progress", {
      step: current,
      result
    });

    return result;
  }
};
