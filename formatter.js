'use strict';

function unwrap(text) {
  const source = text.trim();
  let literal;
  if (source.startsWith('"')) {
    literal = source.replace(/,\s*$/, '').trimEnd();
  } else if (/^[^"]*\\"/.test(source)) {
    // Some clipboard tools omit the outer quotes of a JSON string.
    literal = `"${source}"`;
  } else {
    return source;
  }
  try {
    return JSON.parse(literal).trim();
  } catch (error) {
    throw new SyntaxError(`Invalid JSON-escaped WKT: ${error.message}`);
  }
}

function formatWkt(text, indent = '  ', eol = '\n') {
  const source = unwrap(text);
  const tokens = /"(?:[^"]|"")*"|[()[\],]|[^\s"()[\],]+/gy;
  let pos = 0;
  function fail(message) {
    throw new SyntaxError(`${message} at character ${pos + 1} of the WKT.`);
  }
  function next() {
    while (pos < source.length && /\s/.test(source[pos])) pos++;
    if (pos === source.length) return undefined;
    tokens.lastIndex = pos;
    const match = tokens.exec(source);
    if (!match) fail('Unterminated quoted text');
    pos = tokens.lastIndex;
    return match[0];
  }

  let token = next();
  function value(depth, root = false) {
    if (depth > 256) fail('Nesting exceeds 256 levels');
    const head = token;
    if (!head || /^[()[\],]$/.test(head)) fail('Expected a value');
    token = next();
    if (token !== '[' && token !== '(') {
      if (root) fail('Expected a WKT keyword followed by [ or (');
      return { text: head, group: false };
    }
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(head)) fail('Invalid WKT keyword');
    const open = token;
    const close = open === '[' ? ']' : ')';
    let result = head + open;
    let first = true;
    let multiline = false;
    token = next();
    while (true) {
      const child = value(depth + 1);
      multiline ||= child.group;
      if (!first) result += ',';
      if (multiline) result += eol + indent.repeat(depth + 1);
      else if (!first) result += ' ';
      result += child.text;
      if (token === close) break;
      if (token !== ',') fail(`Expected a comma or ${close}`);
      first = false;
      token = next();
    }
    token = next();
    if (multiline) result += eol + indent.repeat(depth);
    return { text: result + close, group: true };
  }

  const result = value(0, true).text;
  if (token !== undefined) fail('Unexpected text after root element');
  return result + (/\r?\n[ \t]*$/.test(text) ? eol : '');
}

module.exports = { formatWkt };
