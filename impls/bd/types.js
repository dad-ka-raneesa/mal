const pr_str = (ast, print_readably = false) => {
  if (ast instanceof MalValue)
    return ast.pr_str(print_readably);
  return ast.toString();
}

const isEqual = (...args) => {
  const firstElement = args[0];
  let comparator = (x) => x === firstElement;
  if (firstElement instanceof MalValue) comparator = (x) => firstElement.isEqual(x);

  return args.slice(1).every(comparator);
};

class MalValue {
  pr_str(print_readably = false) {
    return "---Default Mal Value---"
  }

  isEmpty() {
    return false;
  }

  count() {
    return 0;
  }

  isEqual(other) {
    return false;
  }
}

class MalSequence extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably = false) {
    return "---Default Mal Sequence---"
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  isEqual(other) {
    if (!(other instanceof MalSequence) || other.count() !== this.count()) {
      return false;
    }

    return this.ast.every((val, i) => isEqual(val, other.ast[i]))
  }
}

class List extends MalSequence {
  constructor(ast) {
    super(ast);
  }

  pr_str(print_readably = false) {
    return `(${this.ast.map(x => pr_str(x, print_readably)).join(' ')})`;
  }
}

class Vector extends MalSequence {
  constructor(ast) {
    super(ast);
  }

  pr_str(print_readably = false) {
    return `[${this.ast.map(x => pr_str(x, print_readably)).join(' ')}]`;
  }
}

class HashMap extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
    this.hashMap = new Map();
    this.initializeHashMap();
  }

  initializeHashMap() {
    for (let i = 0; i < this.ast.length; i += 2) {
      this.hashMap.set(this.ast[i], this.ast[i + 1]);
    }
  }

  pr_str(print_readably = false) {
    let str = [];
    for (const [key, value] of this.hashMap.entries()) {
      str.push(`${pr_str(key, print_readably)} ${pr_str(value, print_readably)}`)
    }
    return `{${str.join(', ')}}`;
  }

  isEmpty() {
    return this.hashMap.isEmpty();
  }

  count() {
    return this.hashMap.size;
  }

  isEqual(other) {
    if (other instanceof HashMap && other.hashmap.size == this.hashmap.size) {
      const keys = [...this.hashmap.keys()];
      return keys.every(key => isEqual(this.hashmap.get(key), other.hashmap.get(key)));
    }
    return false;
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  pr_str(print_readably = false) {
    return "nil";
  }

  isEmpty() {
    return true;
  }

  count() {
    return 0;
  }

  isEqual(other) {
    return (other instanceof NilValue);
  }
}

class Str extends MalValue {
  constructor(string) {
    super();
    this.string = string;
  }

  pr_str(print_readably = false) {
    if (print_readably)
      return `"${this.string
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")}"`
    return this.string;
  }

  isEmpty() {
    return this.string.length === 0;
  }

  count() {
    return this.string.length;
  }

  isEqual(other) {
    return (other instanceof Str) && this.string === other.string;
  }
}

class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  pr_str(print_readably = false) {
    return `:${this.keyword}`;
  }

  isEmpty() {
    throw new Error(`Cannot check 'empty?' for :${this.keyword}`)
  }

  count() {
    throw new Error(`Cannot check 'count' for :${this.keyword}`)
  }

  isEqual(other) {
    return (other instanceof Keyword) && this.keyword === other.keyword;
  }
}

class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(print_readably = false) {
    return this.symbol;
  }

  isEmpty() {
    throw new Error(`Cannot check 'empty?' for ${this.symbol}`)
  }

  count() {
    throw new Error(`Cannot check 'count' for ${this.symbol}`)
  }

  isEqual(other) {
    return (other instanceof MalSymbol) && this.symbol === other.symbol;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, func) {
    super();
    this.ast = ast;
    this.binds = binds;
    this.env = env;
    this.func = func;
  }

  pr_str(print_readably = false) {
    return '#<function>';
  }

  isEmpty() {
    throw new Error(`Cannot check 'empty?' for function`);
  }

  count() {
    throw new Error(`Cannot check 'count' for function`);
  }

  isEqual(other) {
    throw new Error(`Cannot check '=' for function`);
  }

  apply(fstArg, args) {
    return this.func.apply(fstArg, args);
  }
}

class Atom extends MalValue {
  constructor(malValue) {
    super();
    this.malValue = malValue;
  }

  updateValue(malValue) {
    return this.malValue = malValue;
  }

  pr_str(print_readably = false) {
    return `(atom ${pr_str(this.malValue)})`;
  }

  isEmpty() {
    throw new Error(`Cannot check 'empty?' for atom`);
  }

  count() {
    throw new Error(`Cannot check 'count' for atom`);
  }

  isEqual(other) {
    return (other instanceof Atom) && isEqual(this.malValue, other.malValue);
  }
}

const Nil = new NilValue();

module.exports = { MalValue, List, Vector, HashMap, Str, Keyword, MalSymbol, Atom, MalSequence, pr_str, Nil, isEqual, MalFunction };
