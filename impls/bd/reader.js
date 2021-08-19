const { List } = require('./types');

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
  return [...str.matchAll(regEx)].map(x => x[1]).slice(0, -1);
}

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token);
  }

  return token;
}

const read_list = (reader) => {
  const ast = [];
  reader.next();

  while (reader.peek() !== ')') {
    if (!reader.peek())
      throw new Error("unbalanced")
    ast.push(read_form(reader));
  }

  reader.next();
  return new List(ast);
};

const read_form = (reader) => {
  const token = reader.peek();

  if (token[0] == '(') {
    return read_list(reader);
  }

  if (token[0] == ')') {
    throw new Error("unexpected )");
  }

  return read_atom(reader);
}

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = { read_str };