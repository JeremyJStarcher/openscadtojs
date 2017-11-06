# Large parts of this grammar were ripped from
# "docs/referencs/ANSI C grammar (Yacc).html"
# Original URL: https://www.lysator.liu.se/c/ANSI-C-grammar-y.html

@{%
const moo = require("moo");
const tokens = require("../tokenizer/tokenizer");
const lexer = moo.compile(tokens);

// console.log("********************************");
// console.log(JSON.stringify(tokens));
// console.log("********************************");
%}

@lexer lexer


statement
	-> assignment_expression _ ";" _
#    | labeled_statement
#	| compound_statement
#	| 
#	| selection_statement
#	| iteration_statement
#	| jump_statement



primary_expression 
    -> %identifier
     | constant
     | "(" _ expression _ ")"


postfix_expression
    ->  primary_expression
	 | postfix_expression "[" _ expression _ "]"
	 | postfix_expression "(" _ ")"
	 | postfix_expression "(" _ argument_expression_list _ ")"
	
argument_expression_list
    -> assignment_expression
     | argument_expression_list _ "," _ assignment_expression

unary_expression
	-> postfix_expression
	| unary_operator cast_expression

unary_operator
    -> "!"
     | "+"
     | "-"
	
cast_expression
	-> unary_expression

multiplicative_expression
    -> cast_expression
	| multiplicative_expression _ "*" _ cast_expression
	| multiplicative_expression _ "/" _ cast_expression
	| multiplicative_expression _ "%" _ cast_expression
	

additive_expression
	-> multiplicative_expression
	| additive_expression _ "+" _ multiplicative_expression
	| additive_expression _ "-" _ multiplicative_expression
	

shift_expression
	-> additive_expression
	| shift_expression _ "<<" _ additive_expression
	| shift_expression _ ">>" _ additive_expression
	

relational_expression
	-> shift_expression
	| relational_expression _ "<" _ shift_expression
	| relational_expression _ ">" _ shift_expression
	| relational_expression _ "<=" _ shift_expression
	| relational_expression  _ ">=" _ shift_expression
	

equality_expression
	-> relational_expression
	| equality_expression _ "==" _ relational_expression
	| equality_expression _ "!=" _ relational_expression
	

and_expression
	-> equality_expression
	| and_expression _ "&" _ equality_expression
	

exclusive_or_expression
	-> and_expression
	| exclusive_or_expression _ "^" _ and_expression
	

inclusive_or_expression
	-> exclusive_or_expression
	| inclusive_or_expression _ "|" _ exclusive_or_expression
	

logical_and_expression
	-> inclusive_or_expression
	| logical_and_expression _ "&&" _ inclusive_or_expression
	

logical_or_expression
	-> logical_and_expression
	| logical_or_expression _ "||" _ logical_and_expression
	

conditional_expression
	-> logical_or_expression
	| logical_or_expression _ "?" _ expression _ ":" _ conditional_expression
	

assignment_expression
	-> conditional_expression
	| unary_expression assignment_operator assignment_expression
	

assignment_operator
	-> _ "=" _

expression
	-> assignment_expression
	| expression _ "," _ assignment_expression
	

constant
    -> %string
    | %number


# Optional white space
_ -> null | _ [\s] {% function() {} %}
# Required white space
__ -> [\s] | __ [\s] {% function() {} %}         

