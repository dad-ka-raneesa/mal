const readline = require('readline');
const { read_str } = require('./reader');
const { pr_str } = require('./printer');
const { List, Vector, HashMap, MalSymbol, Nil, Str, MalFunction } = require('./types');
const Env = require('./env');
const env = require('./core');

env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
env.set(new MalSymbol('*ARGV*'), new List(process.argv.slice(3).map(x => new Str(x))));

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

const populate = (arg) => {
  let result = new List([]);
  for (let i = arg.ast.length - 1; i >= 0; i--) {
    let elt = arg.ast[i];
    if (elt instanceof List && elt.ast[0] instanceof MalSymbol && elt.ast[0].symbol == 'splice-unquote') {
      result = new List([new MalSymbol('concat'), elt.ast[1], result]);
    }
    else {
      result = new List([new MalSymbol('cons'), quasiquote(elt), result]);
    }
  }
  return result;
}

const quasiquote = (arg) => {
  if (arg instanceof List) {
    if (arg.ast[0] instanceof MalSymbol && arg.ast[0].symbol == 'unquote') {
      return arg.ast[1];
    }
    return populate(arg);
  }
  if (arg instanceof HashMap || arg instanceof MalSymbol)
    return new List([new MalSymbol('quote'), arg]);
  if (arg instanceof Vector)
    return new List([new MalSymbol('vec'), populate(arg)]);
  return arg;
}

const EVAL = (ast, env) => {
  while (true) {
    if (ast === undefined) return Nil;
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }

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
        continue;

      case 'do':
        ast.ast.slice(1, -1).forEach(form => EVAL(form, env));
        ast = ast.ast[ast.ast.length - 1];
        continue;

      case 'if':
        const expr = EVAL(ast.ast[1], env);
        if (expr === Nil || expr === false)
          ast = ast.ast[3];
        else
          ast = ast.ast[2];
        continue;

      case 'fn*':
        const func = function(...exprs) {
          const newEnv = Env.createEnv(env, ast.ast[1].ast, exprs);
          return EVAL(ast.ast[2], newEnv);
        }
        return new MalFunction(ast.ast[2], ast.ast[1].ast, env, func);

      case 'quote':
        return ast.ast[1];

      case 'quasiquote':
        ast = quasiquote(ast.ast[1]);
        continue;

      case 'quasiquoteexpand':
        return quasiquote(ast.ast[1]);
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
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil) ")))))');

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

const loadFile = () => {
  try {
    rep(`(load-file "${process.argv[2]}")`);
  }
  catch (e) {
    console.log(e.message);
  }
  finally {
    process.exit(0);
  }
};

process.argv.length > 2 ? loadFile() : loop();
