const fs = require('fs');
const path = require('path');

class PluginLoader {
  constructor() { this.plugins = {}; }
  load(name, file) {
    if (fs.existsSync(file)) {
      this.plugins[name] = require(file);
      console.log(`✅ Plugin loaded: ${name}`);
    }
  }
  get(name) { return this.plugins[name] || null; }
}
module.exports = PluginLoader;
