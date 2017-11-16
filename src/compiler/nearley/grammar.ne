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
	if (d[0].value !== "echo") {
		throw new Error("ACK. moduleCall should be 'echo'");
	}

	// <name> _ "(" _ expression _ ")"
	//  0     1  2  3     4      5  6

	return new TokenType.ModuleCall(d[0], d[4]);
}

function compoundStatement(d:any[]):any {
	// "{" _ (statement_list) _ "}"
	//  0  1        2         3  4

	// const global: any = Function('return this')() || (42, eval)('this');
	// console.log("code = ", global.HACK_CODE);
	// console.log('length = ', d.length);

	if (d.length === 3) {
		return new TokenType.CompoundStatement(d[0], []);
	} 
	if (d.length === 5) {
		return new TokenType.CompoundStatement(d[0], d[2]);
	}
}

function argumentExpressionList(d: any[]): any{
	// argument_expression_list _ "," _ assignment_expression 
	//            0             1  2  3          4

	return d[0].concat(d[4]);
}

 function debug(d:any[]):any {
 	// debugger;
 	return d;
 }
void(debug);
%}

@lexer lexer
block -> 
	_ statement _
	| block statement _

statement
	-> module_call _ %eos				{% id %}
	| assignment_expression _ %eos		{% function(d) {return debug(d)} %}
#	| labeled_statement					{% id %}
	| compound_statement				{% id %}
#	| 
#	| selection_statement				{% id %}
#	| iteration_statement				{% id %}
#	| jump_statement					{% id %}


primary_expression
	-> %identifier						{% id %}
	| constant							{% id %}
	| "(" _ expression _ ")"			{% unwrapParens %}


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
	

constant
	-> %string									{% stringConstant %}
	| %number									{% numberConstant %}
	| %constant_undefined						{% undefinedConstant %}
	| %constant_boolean							{% booleanConstant %}
#	| %predefined_constant						{% builtInConstant %}


module_call
#	-> assignment_expression							{% id %}
	-> %identifier _ "(" _ module_arguments _ ")"	{% moduleCall %}


argument_expression_list
	-> assignment_expression
	| argument_expression_list _ "," _ assignment_expression {% argumentExpressionList %} 


module_arguments
	-> argument_expression_list	{% id %}
	| _							{% id %}

compound_statement
	-> "{" _ "}"						{% compoundStatement %}
	| "{" _ (statement_list) _ "}"		{% compoundStatement %}


statement_list
	-> statement
	| statement_list statement 			{% d => d[0].concat([d[1]]) %}



# Optional white space
_ -> null | _ [\s]						{% function() {} %}
# Required white space
__ -> [\s] | __ [\s]					{% function() {} %}


