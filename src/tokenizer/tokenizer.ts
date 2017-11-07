export const OPENSCAD_RULES: moo.Rules = {
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    number: /[0-9]+\.{0,1}[0-9]*[e|E]{1}[+/-]?[0-9]+|[0-9]*\.[0-9]*|[0-9]+\.*|[1-9][0-9]|\.[0-9]*/,
    identifier: /[a-zA-Z_][0-9a-zA-Z_]*/,
    special_identifier: /[\$]{1}[_a-zA-Z][0-9a-zA-Z_]*/,
    string: /"(?:[^"\\]|\\.)*"/,
    lparen: '(',
    rparen: ')',
    eos: ';',
    keyword: ['module', 'function', 'include', 'use', 'echo', 'for', 'intersection_for', 'if', 'else', 'assign'],
    operators: ["=", "+", "-", "*", "/", "%", "<", "<=", "==", "!=", ">=", ">", "&&", "||"],
    NL: { match: /\n/, lineBreaks: true },
};
