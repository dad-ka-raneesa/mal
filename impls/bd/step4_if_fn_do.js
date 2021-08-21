const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { List, Vector, HashMap, MalSymbol, Nil } = require('./types');
const Env = require('./env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce((a, b) => a + b, 0));
env.set(new MalSymbol('*'), (...args) => args.reduce((a, b) => a * b, 1));
env.set(new MalSymbol('-'), (...args) => {
  if (args.length === 0) throw new Error('Wrong number of args (0) passed to: -');
  if (args.length === 1) return 0 - args[0];
  return args.slice(1).reduce((a, b) => a - b, args[0]);
});
env.set(new MalSymbol('/'), (...args) => {
  if (args.length === 0) throw new Error('Wrong number of args (0) passed to: /');
  if (args.length === 1) return 1 / args[0];
  return args.slice(1).reduce((a, b) => a / b, args[0]);
});
env.set(new MalSymbol('pi'), Math.PI);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol)
    return env.get(ast);

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

  switch (ast.ast[0].symbol) {
    case 'def!':
      if (ast.ast.length !== 3)
        throw new Error("Incorrect number of arguments to def!");
      return env.set(ast.ast[1], EVAL(ast.ast[2], env));

    case 'let*':
      if (ast.ast.length !== 3)
        throw new Error("Incorrect number of arguments to let*");
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;

      for (let i = 0; i < bindings.length; i += 2) {
        newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      }
      return EVAL(ast.ast[2], newEnv);

    case 'do':
      return ast.ast.slice(1).reduce((_, form) => EVAL(form, env), Nil);

    case 'if':
      const expr = EVAL(ast.ast[1], env);
      if (expr === Nil || expr === false)
        return EVAL(ast.ast[3], env);
      return EVAL(ast.ast[2], env);

    case 'fn*':
      return function(...exprs) {
        const newEnv = Env.createEnv(env, ast.ast[1].ast, exprs);
        return EVAL(ast.ast[2], newEnv);
      }
  }

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
