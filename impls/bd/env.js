const { MalSymbol } = require('./types');

class Env {
  constructor(outer = null) {
    this.data = new Map();
    this.outer = outer;
  }

  set(key, malValue) {
    if (!(key instanceof MalSymbol)) {
      throw new Error(`${key} not symbol`);
    }
    this.data.set(key.symbol, malValue);
    return malValue;
  }

  find(key) {
    if (this.data.has(key.symbol)) {
      return this;
    }

    return this.outer && this.outer.find(key);
  }

  get(key) {
    const env = this.find(key);
    if (env == null) {
      throw new Error(`${key.symbol} not found`);
    }

    return env.data.get(key.symbol);
  }

  static createEnv(outer = null, binds = [], exprs = []) {
    const env = new Env(outer);
    for (let i = 0; i < binds.length; i++) {
      const key = binds[i];
      const value = exprs[i];
      if (key.symbol === '&') {
        env.set(binds[i + 1], exprs.slice(i));
        break;
      }
      if (value === undefined) throw new Error(`No value provided for '${print_str(key)}'`);
      env.set(key, value);

    }
    return env;
  }
}

module.exports = Env;
