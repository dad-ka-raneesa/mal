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
}

module.exports = Env;