const fs = require('fs');
const Env = require('./env');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');
const { MalValue, MalSymbol, List, Str, Atom, Nil, isEqual } = require('./types');

const add = (...args) => args.reduce((a, b) => a + b, 0);

const subtract = (...args) => {
  if (args.length === 0) throw new Error('Wrong number of args (0) passed to: -');
  if (args.length === 1) return args.unshift(0);
  return args.reduce((a, b) => a - b);
}

const multiply = (...args) => args.reduce((a, b) => a * b, 1);

const divide = (...args) => {
  if (args.length === 0) throw new Error('Wrong number of args (0) passed to: /');
  if (args.length === 1) return args.unshift(1);
  return args.reduce((a, b) => a / b);
}

const prn = (...args) => {
  console.log(args.map(x => pr_str(x, true)).join(' '));
  return Nil;
}

const println = (...args) => {
  console.log(args.map(x => pr_str(x, false)).join(' '));
  return Nil;
};

const str = (...args) => new Str(args.map(x => pr_str(x, false)).join(''));

const printStr = (...args) => new Str(args.map(x => pr_str(x, true)).join(' '));

const list = (...args) => new List(args);

const isList = (list) => (list instanceof List) || (Array.isArray(list));

const isEmpty = (ast) => {
  if (ast instanceof MalValue) return ast.isEmpty();
  if (ast.length != undefined) return ast.length === 0;
  throw new Error(`Cannot check 'empty?' for ${pr_str(ast)}`);
}

const count = (ast) => {
  if (ast instanceof MalValue) return ast.count();
  if (ast.length !== undefined) return ast.length;
  throw new Error(`cannot check 'count' for ${print_str(ast)}`);
}

const isLesser = (...args) => {
  if (args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a < b);
};

const isLesserOrEqual = (...args) => {
  if (args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a <= b);
};

const isGreater = (...args) => {
  if (args.length < 2) args.unshift(Infinity);
  return args.reduce((a, b) => a > b);
};

const isGreaterOrEqual = (...args) => {
  if (args.length < 2) args.unshift(Infinity);
  return args.reduce((a, b) => a >= b);
};

const readString = (ast) => {
  if (!ast instanceof Str) {
    throw new Error("Given value is not in string format");
  }
  return read_str(ast.pr_str());
}

const slurp = (ast) => {
  try {
    return new Str(fs.readFileSync(ast.pr_str(), 'utf-8'));
  }
  catch (e) {
    throw new Error(e.message);
  }
};

const createAtom = (ast) => {
  return new Atom(ast);
}

const isAtom = (ast) => {
  return ast instanceof Atom;
}

const derefAtom = (ast) => {
  if (!(ast instanceof Atom))
    throw new Error("Not an atom");
  return ast.malValue;
}

const resetAtom = (ast, malValue) => {
  if (!(ast instanceof Atom))
    throw new Error("Not an atom");
  return ast.updateValue(malValue);
}

const swapAtom = (ast, func, ...args) => {
  if (!(ast instanceof Atom))
    throw new Error("Not an atom");
  return ast.updateValue(func.apply(null, [ast.malValue, ...args]));
}

const env = new Env(null);

env.set(new MalSymbol('+'), add);
env.set(new MalSymbol('-'), subtract);
env.set(new MalSymbol('*'), multiply);
env.set(new MalSymbol('/'), divide);
env.set(new MalSymbol('pi'), Math.PI);
env.set(new MalSymbol('prn'), prn);
env.set(new MalSymbol('println'), println);
env.set(new MalSymbol('str'), str);
env.set(new MalSymbol('pr-str'), printStr);
env.set(new MalSymbol('list'), list);
env.set(new MalSymbol('list?'), isList);
env.set(new MalSymbol('empty?'), isEmpty);
env.set(new MalSymbol('count'), count);
env.set(new MalSymbol('='), isEqual);
env.set(new MalSymbol('<'), isLesser);
env.set(new MalSymbol('<='), isLesserOrEqual);
env.set(new MalSymbol('>'), isGreater);
env.set(new MalSymbol('>='), isGreaterOrEqual);
env.set(new MalSymbol('read-string'), readString);
env.set(new MalSymbol('slurp'), slurp);
env.set(new MalSymbol('atom'), createAtom);
env.set(new MalSymbol('atom?'), isAtom);
env.set(new MalSymbol('deref'), derefAtom);
env.set(new MalSymbol('reset!'), resetAtom);
env.set(new MalSymbol('swap!'), swapAtom);

module.exports = env;
