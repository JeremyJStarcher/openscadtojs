import * as moo from 'moo';
import * as grammar from '../nearley/grammar';
import * as nearley from 'nearley';
import * as TokenType from '../runtime/token-type';
import runToken from "../runtime/run";
import { RunTime } from "./run-time";

function generateAst(source: string): moo.Token[] {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

    parser.feed(source);
    const tokenList = parser.results as [moo.Token[]];

    // If the length == 0, there was no valid tree built.
    // if the length > 1, there is ambiguous grammar that can be parsed
    //     multiple ways.    Either condition is bad.
    if (tokenList.length === 0) {
        throw new Error('Unexpected end of input');
    }
    if (tokenList.length > 1) {
        throw new Error('Ambiguous grammar -- internal parsing error');
    }

    // // The AST comes out *extremely* and horridly nested.
    // // Each parse type that the object travels through becomes another level of
    // // nesting.
    // // Make it pretty.
    // function deNestify(arr: any[] | any): any {

    //     if (Array.isArray(arr) && arr.length === 1) {
    //         // This is what we are really getting rid of -- things with one level of indent.
    //         return deNestify(arr[0]);
    //     } else if (Array.isArray(arr)) {
    //         const out: any[] = [];
    //         arr.forEach(item => {
    //             out.push(deNestify(item));
    //         });

    //         return out;

    //     } else if (typeof arr === 'object') {
    //         Object.keys(arr).forEach(key => {
    //             arr[key] = deNestify(arr[key]);
    //         });

    //         return arr;
    //     }

    //     return arr;
    // }

    return tokenList[0];

    // console.log("TOKENLIST", JSON.stringify(tokenList[0]));
    // const newList = deNestify(tokenList[0]);
    // console.log("AST: ", JSON.stringify(newList));
    // return newList;
}

export function* runAst(runtime: RunTime, ast: TokenType.Token[]): IterableIterator<boolean> {

    try {
        for (let i = 0; i < ast.length; i++) {
            const token = ast[i];

            if (token instanceof TokenType.CompoundStatement) {
                yield* runAst(runtime, token.statements);
            } else if (Array.isArray(token)) {
                if (token.length === 0) {
                    continue;
                }

                yield* runAst(runtime, token);
            } else {

                runToken(runtime, token);
                yield true;
            }
        }
    } catch (err) {
        debugger;
        console.error(`Something bad happened in runAst`, err.message);
        throw (err);
    }
}

export async function compile(src: string): Promise<TokenType.Token[]> {

    try {
        const fullAst = generateAst(src) as TokenType.Token[];

        const errorToken = fullAst[0];
        if (errorToken.type === "error") {
            throw new Error(errorToken.value);
        }

        return fullAst;
    } catch (err) {
        throw err;
    }
}

export function* tokenFeeder(ast: moo.Token[]): IterableIterator<moo.Token> {
    // Get the next token, filtering out token types that are valid, but we are not
    // interested in seeing.


    const filteredTypes = ["eos"];

    if (!Array.isArray(ast)) {
        throw new Error(`tokenFeeder must be given an array`);
    }

    for (let i = 0; i < ast.length; i++) {
        const token = ast[i];
        if (Array.isArray(token)) {
            const tokenAsArray = token as moo.Token[];
            yield* tokenFeeder(tokenAsArray);
        } else {
            if (filteredTypes.indexOf("" + token.type) > -1) {
                continue;
            }
            yield token;
        }
    }
}
