class AIService {
  async generateResume(userData) {
    return `Generated resume for ${userData.name}`;
  }

  async generateCoverLetter(job, user) {
    return `Cover letter for ${job.title}`;
  }

  async analyzeJobMatch(job, skills) {
    return { score: 85, matchedSkills: ['JavaScript', 'React', 'Node.js'] };
  }
}

module.exports = new AIService();
