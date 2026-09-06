const vm = require("vm");

module.exports = function sandboxExecute(code, input = {}) {
  const sandbox = {
    input,
    output: null,
    console: { log: () => {}, error: () => {} },
    require: () => { throw new Error("Sandbox violation: require() blocked."); },
    process: {
      exit: () => { throw new Error("Sandbox violation: exit() blocked."); },
      kill: () => { throw new Error("Sandbox violation: kill() blocked."); },
      env: {}
    },
    fs: {
      writeFileSync: () => { throw new Error("Sandbox violation: FS write blocked."); },
      unlinkSync: () => { throw new Error("Sandbox violation: FS delete blocked."); }
    },
    net: {
      connect: () => { throw new Error("Sandbox violation: network blocked."); }
    }
  };

  try {
    const script = new vm.Script(code, { timeout: 200 });
    const context = vm.createContext(sandbox);
    script.runInContext(context, { timeout: 200 });
    return { safe: true, output: sandbox.output };
  } catch (err) {
    return { safe: false, error: err.message };
  }
};
