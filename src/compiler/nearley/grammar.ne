@preprocessor typescript
@{%
/* tslint:disable:whitespace indent no-trailing-whitespace semicolon no-var-keyword */


// Large parts of this grammar were ripped from
// "docs/referencs/ANSI C grammar (Yacc).html"
// Original URL: https://www.lysator.liu.se/c/ANSI-C-grammar-y.html

import * as moo from "moo";
import * as rules from "../tokenizer/tokenizer";
import * as TokenType from "../runtime/token-type";

/// <reference url="../tokenizer/token-types" />
(<any>rules.OPENSCAD_RULES).myError = { match: /[\$?`]/, error: true };
const lexer = moo.compile(rules.OPENSCAD_RULES);


function unaryOperator(data: any[]) {
	// +, ,1
	// 0 1 2
	
	const expToken = data[2];	
	const operatorToken = data[0];
	return new TokenType.UnaryOperator(operatorToken,expToken);
}

function operator(data: any[]) {

	// multiplicative_expression _ "*" _ cast_expression
    // operator": "1, ,*, ,2",
    //             0 1 2 3 4

    // No clue yet why this sometimes shows up wrapped in an array.
	const expTokenFull = data[2] as moo.Token;
	const expToken =  (expTokenFull instanceof Array) ? expTokenFull[0] : expTokenFull;

	 const lhand = data[0];
     const rhand = data[4];

     return new TokenType.Operator(expToken, lhand, rhand);
}

function identifierF(d:any[]) {
	return new TokenType.Identifier(d[0]);
}

function numberConstant(d:any[]) {
	return new TokenType.Number(d[0]);
}

function stringConstant(d:any[]) {
	return new TokenType.String(d[0]);
}

function booleanConstant(d:any[]) {
	return new TokenType.Boolean(d[0]);
}

function undefinedConstant(d:any[]) {
	return new TokenType.Undefined();
}

// function nullify(d:any[]) {
// 	return null;
// }

// function builtInConstant(d:any[]) {
// 	// return new ScadTokens.BuiltInConstant(d[0]);
// }


function unwrapParens(d:any[]):any {
	 // console.log("unwrapParens: ");
	// "(" _ expression _ ")"
	//  0  1     2      3  4
	return d[2];
}

function moduleCall(d:any[]):any {
	// <name> _ "(" _ expression _ ")"
	//  0     1  2  3     4      5  6

	if (d.length === 7) {
		return new TokenType.ModuleCall(d[0], d[4]);
	} else {
		return new TokenType.ModuleCall(d[0], []);
	}
}

function compoundStatement(d:any[]):any {
	// "{" _ (statement_list) _ "}"
	//  0  1        2         3  4

	if (d.length === 3) {
		return new TokenType.CompoundStatement(d[0], []);
	} 
	if (d.length === 5) {
		return new TokenType.CompoundStatement(d[0], d[2]);
	}
}

function rangeExpressionList(d: any[]): any{
	// argument_expression_list _ "," _ assignment_expression 
	//            0             1  2  3          4

	// argument_expression_list _ "," _ assignment_expression _ ":" _ assignment_expression
	//            0             1  2  3          4            5  6  7           8

	if (d.length === 9) {
		return [d[0], d[4], d[8]];
	} else if (d.length === 5) {
		return [d[0], d[4]];
	}
}


function argumentExpressionList(d: any[]): any{
	// argument_expression_list _ "," _ assignment_expression 
	//            0             1  2  3          4

	return d[0].concat(d[4]);
}

function functionDefinition(d: any[]):any {
	//	"function" __ <name> _ "(" _ argument_expression_list _   ")"  _  "="   _    (expression)
	//	    0       1     3  4  5  6              7            8   9  10   11  12         13

	//	"function" __ <name> _ "(" _ ")"  _  "="   _   (expression)
	//	    0       1     3  4  5  6  7   8   9    10       11

	const d0len = d[0].length;
	if (d0len === 13) {
		const [,,functionName,,,,args,,,,,,expression] = d[0];
		return new TokenType.FunctionDefinition(functionName, args, expression);
	} else {
		const [,,functionName,,,,,,,,expression] = d[0];
		return new TokenType.FunctionDefinition(functionName, [], expression);
	}
}

function vector(d:any[]):any {
	if (d.length === 5) {
			return new TokenType.Vector(d[0], d[2]);
	} else {
		return new TokenType.Vector(d[0], d[4]);
	}
}

function range(d:any[]):any {
	return new TokenType.Range(d[0], d[2]);
}

function comment(d:any[]) {
	return d;
}

 function debug(d:any[]):any {
	//  const global: any = Function('return this')() || (42, eval)('this');
	//  const code = global.HACK_CODE;
	//  console.log("code = ", global.HACK_CODE);
	//  console.log('length = ', d.length);
	//  debugger;
 	return d;
 }
void(debug);
%}

@lexer lexer
block -> 
	_ statement _
	| block statement _

statement
	-> assignment_expression _ %eos		{% d => d %}
	| module_call _ %eos				{% id %}
	| function_statement _ %eos			{% functionDefinition  %}
#	| labeled_statement					{% id %}
	| compound_statement				{% id %}
#	| 
#	| selection_statement				{% id %}
#	| iteration_statement				{% id %}
#	| jump_statement					{% id %}


primary_expression
	-> %identifier						{% identifierF %}
	| constant							{% id %}
	| "(" _ expression _ ")"			{% unwrapParens %}
	| vector_expression					{% id %}
	| range_expression					{% id %}

postfix_expression
	->  primary_expression				{% id %}
	| postfix_expression "[" _ expression _ "]"	{% id %}
#	| postfix_expression "(" _ ")"
#	| postfix_expression "(" _ argument_expression_list _ ")"
	

unary_expression
	-> postfix_expression				{% id %}
	| unary_operator _ cast_expression	{% unaryOperator %}

unary_operator
	-> "!"								{% id %}
	| "+"								{% id %}
	| "-"								{% id %}
	
cast_expression
	-> unary_expression					{% id %}

multiplicative_expression
	-> cast_expression {% id %}
	| multiplicative_expression _ "*" _ cast_expression {% operator %}
	| multiplicative_expression _ "/" _ cast_expression {% operator %}
	| multiplicative_expression _ "%" _ cast_expression {% operator %}
	

additive_expression
	-> multiplicative_expression {% id %}
	| additive_expression _ "+" _ multiplicative_expression {% operator %}
	| additive_expression _ "-" _ multiplicative_expression {% operator %}
	

shift_expression
	-> additive_expression {% id %}
	| shift_expression _ "<<" _ additive_expression {% operator %}
	| shift_expression _ ">>" _ additive_expression {% operator %}
	

relational_expression
	-> shift_expression{% id %}
	| relational_expression _ "<" _ shift_expression {% operator %}
	| relational_expression _ ">" _ shift_expression {% operator %}
	| relational_expression _ "<=" _ shift_expression {% operator %}
	| relational_expression  _ ">=" _ shift_expression {% operator %}
	

equality_expression
	-> relational_expression{% id %}
	| equality_expression _ "==" _ relational_expression {% operator %}
	| equality_expression _ "!=" _ relational_expression {% operator %}
	

and_expression
	-> equality_expression							{% id %}
	| and_expression _ "&" _ equality_expression	{% operator %}
	

exclusive_or_expression
	-> and_expression									{% id %}
	| exclusive_or_expression _ "^" _ and_expression	{% operator %}
	

inclusive_or_expression
	-> exclusive_or_expression									{% id %}
	| inclusive_or_expression _ "|" _ exclusive_or_expression	{% operator %}
	

logical_and_expression
	-> inclusive_or_expression									{% id %}
	| logical_and_expression _ "&&" _ inclusive_or_expression	{% operator %}
	

logical_or_expression
	-> logical_and_expression									{% id %}
	| logical_or_expression _ "||" _ logical_and_expression		{% operator %}
	

conditional_expression
	-> logical_or_expression									{% id %}
	| logical_or_expression _ "?" _ expression _ ":" _ conditional_expression


assignment_expression
	-> conditional_expression									{% id %}
	| %identifier _ assignment_operator _ assignment_expression	{% operator %}
	

assignment_operator
	-> "="	{% id %}

expression
	-> assignment_expression					{% id %}
	| expression _ "," _ assignment_expression	{% id %}
	
vector_expression
	->	"[" _ argument_expression_list _ "]"					{% vector %}

range_expression
	->	"[" _ range_expression_list _ "]"					{% range %}

constant
	-> %string									{% stringConstant %}
	| %number									{% numberConstant %}
	| %constant_undefined						{% undefinedConstant %}
	| %constant_boolean							{% booleanConstant %}
#	| %predefined_constant						{% builtInConstant %}


module_call2
	-> %identifier _ "(" __ ")"	{% moduleCall %}


module_call
	-> %identifier _ "(" _ module_arguments _ ")"	{% moduleCall %}
    | %identifier _ "(" ")"	{% moduleCall %}


argument_expression_list
	-> assignment_expression
	| argument_expression_list _ "," _ assignment_expression {% argumentExpressionList %} 

range_expression_list
	-> assignment_expression _ ":" _ assignment_expression _ ":" _ assignment_expression {% rangeExpressionList %} 
	| assignment_expression _ ":" _ assignment_expression {% rangeExpressionList %} 

module_arguments
	-> argument_expression_list	{% id %}

compound_statement
	-> "{" _ "}"						{% compoundStatement %}
	| "{" _ (statement_list) _ "}"		{% compoundStatement %}

function_statement
	->"function" __ %identifier _ "(" _ ")" _ "=" _ expression
	|	"function" __ %identifier _ "(" _ argument_expression_list _ ")" _ "=" _ (expression)

statement_list
	-> statement
	| statement_list statement 			{% d => d[0].concat([d[1]]) %}

comments
	-> %single_line_comment				{% comment %}
	| %block_comment					{% comment %}


# Optional white space
_
	-> null
	| _ comments					{% id %}
	| _ %WS 						{% function(d) {return void( '[WS' + d + ']')} %}
	| _ %NL 						{% function(d) {return void('[NL' + d + ']')} %}

# Required white space
__
	-> [\s]
	| __ [\s]						{% function() {} %}

