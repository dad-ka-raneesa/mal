const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { List, Vector, HashMap, MalSymbol } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (...args) => {
    if (args.length === 0) throw new Error('Wrong number of args (0) passed to: -');
    const initialParam = args.length === 1 ? 0 : args[0];
    if (args.length === 1) return 0 - args[0];
    return args.slice(1).reduce((a, b) => a - b, args[0]);
  },
  '/': (...args) => {
    if (args.length === 0) throw new Error('Wrong number of args (0) passed to: /');
    if (args.length === 1) return 1 / args[0];
    return args.slice(1).reduce((a, b) => a / b, args[0]);
  },
  'pi': Math.PI
}

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const val = env[ast.symbol];
    if (val)
      return val;
    throw new Error(`${ast.symbol} symbol not found`)
  }

  if (ast instanceof List)
    return new List(ast.ast.map((x) => EVAL(x, env)));

  if (ast instanceof Vector)
    return new Vector(ast.ast.map((x) => EVAL(x, env)));

  if (ast instanceof HashMap) {
    const newAst = [];
    for (const [key, value] of ast.hashMap.entries()) {
      newAst.push(EVAL(key, env), EVAL(value, env));
    }
    return new HashMap(newAst);
  }

  return ast;
}

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof List))
    return eval_ast(ast, env);

  if (ast.isEmpty())
    return ast;

  const [fn, ...args] = eval_ast(ast, env).ast;

  if (fn instanceof Function) {
    return fn.apply(null, args);
  }

  throw new Error(`${fn} is not a function`);
};

const PRINT = (ast) => pr_str(ast, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

const loop = () => {
  rl.question("user> ", (str) => {
    try {
      console.log(rep(str));
    }
    catch (e) {
      console.log(e.message);
    }
    finally {
      loop();
    }

  })
}

loop();
