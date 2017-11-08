// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
function id(d:any[]):any {return d[0];}
declare var identifier:any;
declare var string:any;
declare var number:any;
declare var predefined_constants:any;


// Large parts of this grammar were ripped from
// "docs/referencs/ANSI C grammar (Yacc).html"
// Original URL: https://www.lysator.liu.se/c/ANSI-C-grammar-y.html

import * as moo from "moo";
import * as rules from "../tokenizer/tokenizer";

// Silence TypeScript
void(id);

/// <reference url="../tokenizer/token-types" />
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
export interface Token {value:any; [key: string]:any};
export interface Lexer {reset:(chunk:string, info:any) => void; next:() => Token | undefined; save:() => any; formatError:(token:Token) => string; has:(tokenType:string) => boolean};
export interface NearleyRule {name:string; symbols:NearleySymbol[]; postprocess?:(d:any[],loc?:number,reject?:{})=>any};
export type NearleySymbol = string | {literal:any} | {test:(token:any) => boolean};
export var Lexer:Lexer|undefined = lexer;
export var ParserRules:NearleyRule[] = [
    {"name": "block", "symbols": ["_", "statement", "_"]},
    {"name": "block", "symbols": ["block", "statement", "_"]},
    {"name": "statement", "symbols": ["assignment_expression", "_", {"literal":";"}]},
    {"name": "primary_expression", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)]},
    {"name": "primary_expression", "symbols": ["constant"]},
    {"name": "primary_expression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": function(d) {return unwrapParens(d)}},
    {"name": "postfix_expression", "symbols": ["primary_expression"]},
    {"name": "postfix_expression", "symbols": ["postfix_expression", {"literal":"["}, "_", "expression", "_", {"literal":"]"}]},
    {"name": "postfix_expression", "symbols": ["postfix_expression", {"literal":"("}, "_", {"literal":")"}]},
    {"name": "postfix_expression", "symbols": ["postfix_expression", {"literal":"("}, "_", "argument_expression_list", "_", {"literal":")"}]},
    {"name": "argument_expression_list", "symbols": ["assignment_expression"]},
    {"name": "argument_expression_list", "symbols": ["argument_expression_list", "_", {"literal":","}, "_", "assignment_expression"]},
    {"name": "unary_expression", "symbols": ["postfix_expression"]},
    {"name": "unary_expression", "symbols": ["unary_operator", "cast_expression"]},
    {"name": "unary_operator", "symbols": [{"literal":"!"}]},
    {"name": "unary_operator", "symbols": [{"literal":"+"}]},
    {"name": "unary_operator", "symbols": [{"literal":"-"}]},
    {"name": "cast_expression", "symbols": ["unary_expression"]},
    {"name": "multiplicative_expression", "symbols": ["cast_expression"]},
    {"name": "multiplicative_expression", "symbols": ["multiplicative_expression", "_", {"literal":"*"}, "_", "cast_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "multiplicative_expression", "symbols": ["multiplicative_expression", "_", {"literal":"/"}, "_", "cast_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "multiplicative_expression", "symbols": ["multiplicative_expression", "_", {"literal":"%"}, "_", "cast_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "additive_expression", "symbols": ["multiplicative_expression"]},
    {"name": "additive_expression", "symbols": ["additive_expression", "_", {"literal":"+"}, "_", "multiplicative_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "additive_expression", "symbols": ["additive_expression", "_", {"literal":"-"}, "_", "multiplicative_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "shift_expression", "symbols": ["additive_expression"]},
    {"name": "shift_expression", "symbols": ["shift_expression", "_", {"literal":"<<"}, "_", "additive_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "shift_expression", "symbols": ["shift_expression", "_", {"literal":">>"}, "_", "additive_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "relational_expression", "symbols": ["shift_expression"]},
    {"name": "relational_expression", "symbols": ["relational_expression", "_", {"literal":"<"}, "_", "shift_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "relational_expression", "symbols": ["relational_expression", "_", {"literal":">"}, "_", "shift_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "relational_expression", "symbols": ["relational_expression", "_", {"literal":"<="}, "_", "shift_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "relational_expression", "symbols": ["relational_expression", "_", {"literal":">="}, "_", "shift_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "equality_expression", "symbols": ["relational_expression"]},
    {"name": "equality_expression", "symbols": ["equality_expression", "_", {"literal":"=="}, "_", "relational_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "equality_expression", "symbols": ["equality_expression", "_", {"literal":"!="}, "_", "relational_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "and_expression", "symbols": ["equality_expression"]},
    {"name": "and_expression", "symbols": ["and_expression", "_", {"literal":"&"}, "_", "equality_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "exclusive_or_expression", "symbols": ["and_expression"]},
    {"name": "exclusive_or_expression", "symbols": ["exclusive_or_expression", "_", {"literal":"^"}, "_", "and_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "inclusive_or_expression", "symbols": ["exclusive_or_expression"]},
    {"name": "inclusive_or_expression", "symbols": ["inclusive_or_expression", "_", {"literal":"|"}, "_", "exclusive_or_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "logical_and_expression", "symbols": ["inclusive_or_expression"]},
    {"name": "logical_and_expression", "symbols": ["logical_and_expression", "_", {"literal":"&&"}, "_", "inclusive_or_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "logical_or_expression", "symbols": ["logical_and_expression"]},
    {"name": "logical_or_expression", "symbols": ["logical_or_expression", "_", {"literal":"||"}, "_", "logical_and_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "conditional_expression", "symbols": ["logical_or_expression"]},
    {"name": "conditional_expression", "symbols": ["logical_or_expression", "_", {"literal":"?"}, "_", "expression", "_", {"literal":":"}, "_", "conditional_expression"]},
    {"name": "assignment_expression", "symbols": ["conditional_expression"]},
    {"name": "assignment_expression", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier), "_", "assignment_operator", "_", "assignment_expression"], "postprocess": function(d) {return operator(d)}},
    {"name": "assignment_operator", "symbols": [{"literal":"="}]},
    {"name": "expression", "symbols": ["assignment_expression"]},
    {"name": "expression", "symbols": ["expression", "_", {"literal":","}, "_", "assignment_expression"]},
    {"name": "constant", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": d => constToken(d)},
    {"name": "constant", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => constToken(d)},
    {"name": "constant", "symbols": [(lexer.has("predefined_constants") ? {type: "predefined_constants"} : predefined_constants)], "postprocess": d => constToken(d)},
    {"name": "_", "symbols": []},
    {"name": "_", "symbols": ["_", /[\s]/], "postprocess": function() {}},
    {"name": "__", "symbols": [/[\s]/]},
    {"name": "__", "symbols": ["__", /[\s]/], "postprocess": function() {}}
];
export var ParserStart:string = "block";
