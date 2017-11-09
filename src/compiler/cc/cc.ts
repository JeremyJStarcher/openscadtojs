// import * as rules from '../tokenizer/tokenizer';
import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';
import { Context } from './context/context';



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

export async function compile(src: string): Promise<moo.Token[]> {

    const fullAst = generateAst(src);

    const errorToken = fullAst[0];
    if (errorToken.type === "error") {
        throw new Error(errorToken.value);
    }

    const cleanedAst = deNest(fullAst);
    return (<any>cleanedAst[0]);
}



export function deNest(val: moo.Token[] | moo.Token): moo.Token[] {
    const filteredTypes = ["eos", "null"];

    let out: moo.Token[] = [];

    if (!val) {
        return val;
    }

    if (!Array.isArray(val)) {
        if (typeof val === "object") {
            const newObj: any = {};
            Object.keys(val).forEach(key => {
                newObj[key] = deNest(val[key]);
            });
            return newObj;
        }
        return val;
    }

    if (val.length === 1) {
        return deNest(val[0]);
    } else {

        val.forEach(v => {
            // Sometimes we get greebly empty arrays, maybe of whitespace or something.
            if (Array.isArray(v) && v.length === 0) {
                return;
            }
            const v2: any = deNest(v);
            out.push(v2);
        });

        const noNull = out.filter(p => p && filteredTypes.indexOf("" + p.type) === -1);
        return noNull;
    }
}
