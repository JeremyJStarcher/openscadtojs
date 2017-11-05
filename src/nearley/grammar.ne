@{%
const moo = require("moo");
const tokens = require('../tokenizer/tokenizer');
const lexer = moo.compile(tokens);

// console.log("********************************");
// console.log(tokens);
// console.log("********************************");
%}

@lexer lexer

expression -> "1+2+3"
           | %number