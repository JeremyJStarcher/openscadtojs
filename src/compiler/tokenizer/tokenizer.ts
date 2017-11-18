export const OPENSCAD_RULES /*:  moo.Rules */ = {
    WS: /[ \t]+/,
    NL: { match: /\n|\r/, lineBreaks: true },
    comment: /\/\/.*?$/,
    number: /[0-9]+\.{0,1}[0-9]*[e|E]{1}[+/-]?[0-9]+|[0-9]*\.[0-9]*|[0-9]+\.*|[1-9][0-9]|\.[0-9]*/,
    //constant_undefined: 'undef',
    //predefined_constant: 'pi',
    //constant_boolean: ['true', 'false'],
    identifier: {
        match: /[a-zA-Z_][0-9a-zA-Z_]*/, keywords: {
            constant_boolean: ['true', 'false'],
            constant_undefined: ['undef']
        }
    },
    special_identifier: /[\$]{1}[_a-zA-Z][0-9a-zA-Z_]*/,
    string: /"(?:[^"\\]|\\.)*"/,
    lparen: '(',
    rparen: ')',
    eos: ';',
    /* echo */
    keyword: ['true', 'false', 'module', 'function', 'include', 'use', 'for', 'intersection_for', 'if', 'else', 'assign'],
    lbrace: '{',
    rbrace: '}',
    unary_operator: ["!", "+", "-"],
    argument_separator: ",",
    operator: ["=", "+", "-", "*", "/", "%", "<", "<=", "==", "!=", ">=", ">", "&&", "||"]
};




// IDEN: {match: /[a-zA-Z]+/, keywords: {
  //      KW: ['while', 'if', 'else', 'moo', 'cows']),
    //  }},

      //    identifier: /[a-zA-Z_][0-9a-zA-Z_]*/,
      //*/