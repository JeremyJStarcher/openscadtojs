@{%
const moo = require("moo");
const tokens = require('../tokenizer/tokenizer');
const lexer = moo.compile(tokens);

console.log("********************************");
console.log(JSON.stringify(tokens));
console.log("********************************");
%}

@lexer lexer

expression -> "1+2+3"
           | constant
           | constant _ %operators _ constant


operator -> %operators
constant -> %string
         | %number



# Optional white space
_ -> null | _ [\s] {% function() {} %}
# Required white space
__ -> [\s] | __ [\s] {% function() {} %}         