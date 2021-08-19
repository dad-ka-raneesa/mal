const pr_str = (ast) => {
  if (ast instanceof MalValue)
    return ast.pr_str();
  return ast.toString();
}

class MalValue {
  pr_str() {
    return "---Default Mal Value---"
  }
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    return '(' + this.ast.map(pr_str).join(' ') + ')';
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    return '[' + this.ast.map(pr_str).join(' ') + ']';
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  pr_str() {
    return "nil";
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, pr_str, Nil };