import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';
import { Context } from './context/context';
import * as TokenType from "../runtime/token-type";
import runToken from "../runtime/run";

function generateAst(source: string): moo.Token[] {

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

    parser.feed(source);
    const tokenList = parser.results as [moo.Token[]];

    // If the length == 0, there was no valid tree built.
    // if the length > 1, there is ambiguous grammar that can be parsed
    //   multiple ways.  Either condition is bad. 
    if (tokenList.length === 0) {
        throw new Error('Unexpected end of input');
    }
    if (tokenList.length > 1) {
        throw new Error('Ambiguous grammar -- internal parsing error');
    }

    return tokenList[0];
}

export function runAst(ast: TokenType.Token[], context: Context) {
    return new Promise((resolve, reject) => {

        try {
            for (let i = 0; i < ast.length; i++) {
                const token = ast[i];
                runToken(context, token);
            }
        } catch (err) {
            reject(err);
        }

        resolve();
    });
}

export async function compile(src: string): Promise<TokenType.Token[]> {

    const fullAst = generateAst(src) as TokenType.Token[];

    const errorToken = fullAst[0];
    if (errorToken.type === "error") {
        throw new Error(errorToken.value);
    }

    return fullAst;
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
