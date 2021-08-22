const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { List, Vector, HashMap, MalSymbol, Nil, MalFunction } = require('./types');
const Env = require('./env');
const env = require('./core');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  while (true) {
    if (ast === undefined) return Nil;
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
        ast = ast.ast[2];
        env = newEnv;
        break;

      case 'do':
        ast.ast.slice(1, -1).forEach(form => EVAL(form, env));
        ast = ast.ast[ast.ast.length - 1];
        break;

      case 'if':
        const expr = EVAL(ast.ast[1], env);
        if (expr === Nil || expr === false)
          ast = ast.ast[3];
        else
          ast = ast.ast[2];
        break;

      case 'fn*':
        return new MalFunction(ast.ast[2], ast.ast[1].ast, env);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof MalFunction) {
      env = Env.createEnv(fn.env, fn.binds, args)
      ast = fn.ast;
      continue;
    }

    if (fn instanceof Function) {
      return fn.apply(null, args);
    }

    throw new Error(`${fn} is not a function`);
  }
};

const PRINT = (ast) => pr_str(ast, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

rep('(def! not (fn* (a) (if a false true)))');

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
