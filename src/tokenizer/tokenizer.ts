import * as moo from 'moo'

export module TokenizerModule {


    export const OPENSCAD_RULES: moo.Rules = {
        WS: /[ \t]+/,
        comment: /\/\/.*?$/,
        number: /[0-9]+\.{0,1}[0-9]*[e|E]{1}[+/-]?[0-9]+|[0-9]*\.[0-9]*|[0-9]+\.*|[1-9][0-9]|\.[0-9]*/,
        string: /"(?:[^"\\]|\\.)*"/,
        lparen: '(',
        rparen: ')',
        keyword: ['module', 'function', 'include', 'use', 'echo', 'for', 'intersection_for', 'if', 'else', 'assign'],
        operators: ["=", "+", "-", "*", "/", "%", "<", "<=", "==", "!=", ">=", ">", "&&",  "||", "!", "?", ":"],
        NL: { match: /\n/, lineBreaks: true },
    };

    export class Tokenizer {
        constructor(str: string) {

        }
    }
}