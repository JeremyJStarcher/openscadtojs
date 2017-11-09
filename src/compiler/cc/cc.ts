// import * as rules from '../tokenizer/tokenizer';
import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';
import { Context } from './context/context';
import * as ScadTokens from "../tokenizer/scad-types";

function generateAst(source: string): moo.Token[] {

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

    parser.feed(source);
    const tokenList = parser.results as [moo.Token[]];


    const errResult: moo.Token = {
        type: "error",
        value: "",
        offset: 0,
        size: 0,
        lineBreaks: false,
        line: 0,
        col: 0
    };


    // If the length == 0, there was no valid tree built.
    // if the length > 1, there is ambiguous grammar that can be parsed
    //   multiple ways.  Either condition is bad. 
    if (tokenList.length === 0) {
        errResult.value = "Unexpected end of input";
        return [errResult];
    }
    if (tokenList.length > 1) {
        errResult.value = "Ambiguous grammar -- internal parsing error";
        return [errResult];
    }

    return tokenList[0];
}

async function runOneToken(token: moo.Token, context: Context) {
}

export function runAst(ast: moo.Token[], context: Context) {
    return new Promise((resolve, reject) => {

        for (let i = 0; i < ast.length; i++) {
            const token = ast[i];
            runOneToken(token, context);
        }
    });
}

export async function compile(src: string): Promise<ScadTokens.Token[]> {

    const fullAst = generateAst(src);

    const errorToken = fullAst[0];
    if (errorToken.type === "error") {
        throw new Error(errorToken.value);
    }

    return fullAst;
}

export function* tokenFeeder(ast: moo.Token[]): IterableIterator<moo.Token> {
    const filteredTypes = ["eos", "null"];

    if (!Array.isArray(ast)) {
        throw new Error(`tokenFeeder must be given an array`);
    }

    for (let i = 0; i < ast.length; i++) {
        const token = ast[i];
        if (Array.isArray(token)) {
            const tokenAsArray = token as moo.Token[];
            if (tokenAsArray.length === 0) {
                continue;
            }
            yield* tokenFeeder(tokenAsArray);
        } else {
            if (filteredTypes.indexOf("" + token.type) > -1) {
                continue;
            }
            yield token;
        }
    }
}
