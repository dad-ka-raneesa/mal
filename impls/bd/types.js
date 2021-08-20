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
    return '(' + this.ast.map(x => pr_str(x, print_readably)).join(' ') + ')';
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably = false) {
    return '[' + this.ast.map(x => pr_str(x, print_readably)).join(' ') + ']';
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
      return '"' + this.string
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    return '"' + this.string + '"';
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, Str, pr_str, Nil };