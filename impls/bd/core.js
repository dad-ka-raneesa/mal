const Env = require('./env');
const { pr_str } = require('./printer');
const { MalValue, MalSymbol, List, Str, Nil, isEqual } = require('./types');

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

module.exports = env;
