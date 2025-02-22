const { List, Vector, HashMap, Str, Keyword, MalSymbol, Nil } = require('./types');

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    if (this.position < this.tokens.length) this.position++;
    return token;
  }
}

const tokenize = (str) => {
  const regEx = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(regEx)]
    .map(x => x[1])
    .filter(x => x[0] != ';')
    .slice(0, -1);
}

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/))
    return parseInt(token);

  if (token.match(/^-?[0-9][0-9.]*$/))
    return parseFloat(token);

  if (token == "true")
    return true;

  if (token == "false")
    return false;

  if (token == "nil")
    return Nil;

  if (token.startsWith(":"))
    return new Keyword(token.slice(1));

  if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    const str = token.slice(1, token.length - 1).replace(/\\(.)/g, function(_, c) { return c === "n" ? "\n" : c })
    return new Str(str);
  }

  if (token.startsWith('"'))
    throw new Error('unbalanced "');

  return new MalSymbol(token);
}

const read_seq = (reader, closing) => {
  const ast = [];
  reader.next();

  while (reader.peek() !== closing) {
    if (!reader.peek())
      throw new Error("unbalanced")
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
}

const read_list = (reader) => {
  const ast = read_seq(reader, ')');
  return new List(ast);
};

const read_vector = (reader) => {
  const ast = read_seq(reader, ']');
  return new Vector(ast);
};

const read_hash_map = (reader) => {
  const ast = read_seq(reader, '}');
  if (ast.length % 2 !== 0) throw new Error("unbalanced")
  return new HashMap(ast);
};

const prependSymbol = (value, reader) => {
  reader.next();
  return new List([new MalSymbol(value), read_form(reader)]);
}

const read_form = (reader) => {
  const token = reader.peek();

  if (token === undefined) return Nil;

  switch (token) {
    case '(': return read_list(reader);
    case '[': return read_vector(reader);
    case '{': return read_hash_map(reader);
    case ')': throw new Error("unexpected )");
    case ']': throw new Error("unexpected ]");
    case '}': throw new Error("unexpected }");
    case '@': return prependSymbol('deref', reader);
    case '\'': return prependSymbol('quote', reader);
    case '`': return prependSymbol('quasiquote', reader);
    case '~': return prependSymbol('unquote', reader);
    case '~@': return prependSymbol('splice-unquote', reader);
  }

  return read_atom(reader);
}

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = { read_str };
