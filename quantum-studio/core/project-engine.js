"use strict";

const fs = require("fs");
const path = require("path");

const PROJECTS = path.join(__dirname, "..", "projects");

function ensure() {
  fs.mkdirSync(PROJECTS, { recursive: true });
}

function createProject(input = {}) {
  ensure();

  if (!input.name) throw new Error("PROJECT_NAME_REQUIRED");
  if (!input.type) throw new Error("PROJECT_TYPE_REQUIRED");

  const project = {
    id: "QS-" + Date.now(),
    name: String(input.name),
    type: String(input.type),
    objective: String(input.objective || ""),
    targetAudience: input.targetAudience || null,
    technology: input.technology || "ADAPTER_AUTO_SELECT",
    qualityBar: input.qualityBar || "PREMIUM",
    status: "SPECIFICATION_READY",
    owner: "House of Jazzu",
    executive: "Nia",
    studio: "Quantum Studio",
    governance: {
      autonomousGeneration: true,
      autonomousTesting: true,
      externalExecution: false,
      productionRelease: "OWNER_AUTHORIZATION_REQUIRED"
    },
    createdAt: new Date().toISOString()
  };

  const file = path.join(PROJECTS, `${project.id}.json`);
  fs.writeFileSync(file, JSON.stringify(project, null, 2));

  return project;
}

function listProjects() {
  ensure();

  return fs.readdirSync(PROJECTS)
    .filter(file => file.endsWith(".json"))
    .map(file => {
      try {
        return JSON.parse(
          fs.readFileSync(path.join(PROJECTS, file), "utf8")
        );
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function getProject(id) {
  return listProjects().find(project => project.id === id) || null;
}

module.exports = {
  createProject,
  listProjects,
  getProject
};
