export const OPENSCAD_RULES /*:  moo.Rules */ = {
    block_comment: { match: /\/\*(?:[^\*\/]||\/\*|\\.)*?\*\//, lineBreaks: true },

    single_line_comment: /\/\/.*?$/,
    number: /[0-9]+\.{0,1}[0-9]*[e|E]{1}[+/-]?[0-9]+|[0-9]*\.[0-9]*|[0-9]+\.*|[1-9][0-9]|\.[0-9]*/,
    identifier: {
        match: /[a-zA-Z_][0-9a-zA-Z_]*/, keywords: {
            constant_boolean: ['true', 'false'],
            constant_undefined: ['undef'],
            ifKeyword: ['if', 'else'],
            moduleKeyword: ['module'],
        }
    },
    special_identifier: /[\$]{1}[_a-zA-Z][0-9a-zA-Z_]*/,
    string: /"(?:[^"\\]|\\.)*?"/,
    lparen: '(',
    rparen: ')',
    eos: ';',
    keyword: ['function', 'include', 'use', 'for', 'intersection_for', 'assign'],
    lbrace: '{',
    rbrace: '}',
    lbracket: '[',
    rbracket: ']',
    argument_separator: ',',
    operator: ['!', '=', '+', '-', '*', '/', '%', '<', '<=', '==', '!=', '>=', '>', '&&', '||', ':'],
    WS: /[ \t]+/,
    NL: { match: /\n|\r/, lineBreaks: true }
};

