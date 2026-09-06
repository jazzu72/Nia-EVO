const missionEngine = require("./mission-engine");
const convoMemory = require("../memory/conversation-memory");
const { Configuration, OpenAIApi } = require("openai");

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

module.exports = {
  async executeNextStep() {
    const missions = missionEngine.listMissions()
      .filter(m => m.status === "active");

    if (missions.length === 0) return "NO_ACTIVE_MISSIONS";

    missions.forEach(m => {
      m.priorityScore = missionEngine.computePriority(m);
    });
    missions.sort((a, b) => b.priorityScore - a.priorityScore);

    const mission = missions[0];
    const nextStep = mission.steps.find(s => !s.done);
    if (!nextStep) return "NO_STEPS";

    const prompt = `
You are NIA, sovereign intelligence of House of Jazzu.
Execute the following mission step:

Mission: ${mission.name}
Step: ${nextStep.text}

Return a short, clear summary of what you accomplished.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are NIA, autonomous operator." },
        { role: "user", content: prompt }
      ]
    });

    const result = completion.data.choices[0].message.content;

    missionEngine.completeStep(mission.id, nextStep.id);
    convoMemory.append("assistant", `Mission '${mission.name}' step completed: ${result}`);

    return result;
  }
};
