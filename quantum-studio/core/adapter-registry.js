"use strict";

const CURRENT_SCHEMA = "2.0.0";

const adapters = {
  flutter: {
    id: "adapter_flutter",
    name: "Flutter",
    platform: "mobile",
    supportedSchema: ["2.0.0"],
    capabilities: ["2D", "UI", "TOUCH", "AUDIO"],
    status: "SCAFFOLDED"
  },

  web: {
    id: "adapter_web",
    name: "Web",
    platform: "web",
    supportedSchema: ["2.0.0"],
    capabilities: ["2D", "UI", "WEB_AUDIO"],
    status: "SCAFFOLDED"
  },

  unity: {
    id: "adapter_unity",
    name: "Unity",
    platform: "3D/XR",
    supportedSchema: ["2.0.0"],
    capabilities: ["3D", "XR", "ANIMATION", "AUDIO"],
    status: "SCAFFOLDED"
  }
};

function register(adapter) {
  if (!adapter || !adapter.id) throw new Error("INVALID_ADAPTER");
  adapters[adapter.id] = adapter;
  return adapter;
}

function get(name) {
  const adapter = adapters[name] || Object.values(adapters).find(a => a.id === name);
  if (!adapter) throw new Error(`ADAPTER_NOT_FOUND:${name}`);
  return adapter;
}

function list() {
  return Object.values(adapters);
}

function validate(name, schemaVersion = CURRENT_SCHEMA) {
  const adapter = get(name);

  return {
    adapter: adapter.id,
    schemaVersion,
    compatible: adapter.supportedSchema.includes(schemaVersion),
    capabilities: adapter.capabilities
  };
}

function validateAll(schemaVersion = CURRENT_SCHEMA) {
  return list().map(adapter => ({
    ...validate(adapter.id, schemaVersion),
    status: adapter.status
  }));
}

module.exports = {
  CURRENT_SCHEMA,
  register,
  get,
  list,
  validate,
  validateAll
};
