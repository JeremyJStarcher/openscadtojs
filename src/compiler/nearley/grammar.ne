@preprocessor typescript
@{%

// Large parts of this grammar were ripped from
// "docs/referencs/ANSI C grammar (Yacc).html"
// Original URL: https://www.lysator.liu.se/c/ANSI-C-grammar-y.html

import * as moo from "moo";
import * as rules from "../tokenizer/tokenizer";

// Silence TypeScript
void(id);

/// <reference url="../tokenizer/token-types" />
(<any>rules.OPENSCAD_RULES).myError = { match: /[\$?`]/, error: true };
const lexer = moo.compile(rules.OPENSCAD_RULES);


function operator(data: any[]) {
     // multiplicative_expression _ "*" _ cast_expression
     // operator": "1, ,*, ,2",
     //             0 1 2 3 4

    // No clue yet why this sometimes shows up wrapped in an array.
    const expTokenFull = data[2];
    const expToken = Array.isArray(expTokenFull) ? expTokenFull[0] : expTokenFull;

    if (Array.isArray(expTokenFull)  && expTokenFull.length !== 1) {
        throw new Error("Operator parser did not expect to find operatorArray this size.");
    }

 
     const r: IScadOperator = expToken as IScadOperator;
     r.lhand = data[0];
     r.rhand = data[4];
     r.func = expToken.value;
     // console.log("DATA2:  ", JSON.stringify(expToken));
        return r;
    }

    function unwrapParens(d:any[]):any  {
        // console.log("unwrapParens: ", JSON.stringify(d[2]));
         // "(" _ expression _ ")"
         //  0  1     2      3  4
         return d[2];
    }
         
   function constToken(d:any[]) {
       return d[0];
   }
%}

@lexer lexer
block -> 
	_ statement _
	| block statement _

statement
	-> assignment_expression _ %eos
#    | labeled_statement
#	| compound_statement
#	| 
#	| selection_statement
#	| iteration_statement
#	| jump_statement



primary_expression 
    -> %identifier
     | constant  
     | "(" _ expression _ ")" {% function(d) {return unwrapParens(d)} %}


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
	| multiplicative_expression _ "*" _ cast_expression {% function(d) {return operator(d)} %}
	| multiplicative_expression _ "/" _ cast_expression {% function(d) {return operator(d)} %}
	| multiplicative_expression _ "%" _ cast_expression {% function(d) {return operator(d)} %}
	

additive_expression
	-> multiplicative_expression
	| additive_expression _ "+" _ multiplicative_expression {% function(d) {return operator(d)} %}
	| additive_expression _ "-" _ multiplicative_expression {% function(d) {return operator(d)} %}
	

shift_expression
	-> additive_expression
	| shift_expression _ "<<" _ additive_expression {% function(d) {return operator(d)} %}
	| shift_expression _ ">>" _ additive_expression {% function(d) {return operator(d)} %}
	

relational_expression
	-> shift_expression
	| relational_expression _ "<" _ shift_expression {% function(d) {return operator(d)} %}
	| relational_expression _ ">" _ shift_expression {% function(d) {return operator(d)} %}
	| relational_expression _ "<=" _ shift_expression {% function(d) {return operator(d)} %}
	| relational_expression  _ ">=" _ shift_expression {% function(d) {return operator(d)} %}
	

equality_expression
	-> relational_expression
	| equality_expression _ "==" _ relational_expression {% function(d) {return operator(d)} %}
	| equality_expression _ "!=" _ relational_expression {% function(d) {return operator(d)} %}
	

and_expression
	-> equality_expression
	| and_expression _ "&" _ equality_expression {% function(d) {return operator(d)} %}
	

exclusive_or_expression
	-> and_expression
	| exclusive_or_expression _ "^" _ and_expression {% function(d) {return operator(d)} %}
	

inclusive_or_expression
	-> exclusive_or_expression
	| inclusive_or_expression _ "|" _ exclusive_or_expression {% function(d) {return operator(d)} %}
	

logical_and_expression
	-> inclusive_or_expression
	| logical_and_expression _ "&&" _ inclusive_or_expression {% function(d) {return operator(d)} %}
	

logical_or_expression
	-> logical_and_expression
	| logical_or_expression _ "||" _ logical_and_expression {% function(d) {return operator(d)} %}
	

conditional_expression
	-> logical_or_expression
	| logical_or_expression _ "?" _ expression _ ":" _ conditional_expression
	

assignment_expression
	-> conditional_expression
	| %identifier _ assignment_operator _ assignment_expression {% function(d) {return operator(d)} %}
	

assignment_operator
	-> "="

expression
	-> assignment_expression
	| expression _ "," _ assignment_expression
	

constant
    -> %string  {% d => constToken(d) %}
     | %number  {% d => constToken(d) %}
     | %predefined_constant {% d => constToken(d) %}



# Optional white space
_ -> null | _ [\s] {% function() {} %}
# Required white space
__ -> [\s] | __ [\s] {% function() {} %}


