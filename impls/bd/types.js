const pr_str = (ast, print_readably = false) => {
  if (ast instanceof MalValue)
    return ast.pr_str(print_readably);
  return ast.toString();
}

class MalValue {
  pr_str(print_readably = false) {
    return "---Default Mal Value---"
  }
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably = false) {
    return `(${this.ast.map(x => pr_str(x, print_readably)).join(' ')})`;
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
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
  }

  initializeHashMap() {
    for (let i = 0; i < this.ast.length; i += 2) {
      this.hashMap.set(this.ast[i], this.ast[i + 1]);
    }
  }

  pr_str(print_readably = false) {
    let str = [];
    this.initializeHashMap();
    for (const [key, value] of this.hashMap.entries()) {
      str.push(`${pr_str(key, print_readably)} ${pr_str(value, print_readably)}`)
    }
    return `{${str.join(', ')}}`;
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  pr_str(print_readably = false) {
    return "nil";
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
    return `"${this.string}"`;
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
}

class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(print_readably = false) {
    return this.symbol;
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, HashMap, Str, Keyword, MalSymbol, pr_str, Nil };