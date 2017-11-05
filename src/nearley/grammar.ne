@{%
const moo = require("moo");
const tokens = require('../tokenizer/tokenizer');
const lexer = moo.compile(tokens);

// console.log("********************************");
// console.log(JSON.stringify(tokens));
// console.log("********************************");
%}

@lexer lexer

#expression -> 
#             constant
#           | constant _ %operators _ constant
#           | statement

#cluster -> _
 #       | statement _

statment -> _ %identifier _ "=" _ expr _ %eos _

expr -> 
		constant # //numbers
	|	%identifier #  //variables
#	|	"(" _ expr _ ")" #grouping with parentheses
#	# |	('+' | '-') _ expr	# //unary plus/minus
#	|	expr "/" expr		# //division
#	|	expr "*" expr	# //explicit multiplication
#	|	expr expr	# //implicit multiplication
	|	expr _ "+" _ expr #//addition/subtraction
    |	expr _ "-" _ expr #//addition/subtraction

lvalue -> %identifier
rvalue -> %identifier | constant



constant -> %string
         | %number





# Optional white space
_ -> null | _ [\s] {% function() {} %}
# Required white space
__ -> [\s] | __ [\s] {% function() {} %}         