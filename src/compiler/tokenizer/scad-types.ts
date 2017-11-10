import { Context } from '../cc/context/context';
import * as cc from "../cc/cc";
import * as ScadTokens from "../tokenizer/scad-types";

export class Token {
    public toString: () => string;
    public type?: string;
    public value: any;
    public offset: number;
    public size: number;
    public lineBreaks: boolean;
    public line: number;
    public col: number;

    constructor(mooToken: moo.Token) {
        this.toString = mooToken.toString;
        this.type = mooToken.type;
        this.value = mooToken.value;
        this.offset = mooToken.offset;
        this.size = mooToken.size;
        this.lineBreaks = mooToken.lineBreaks;
        this.line = mooToken.line;
        this.col = mooToken.col;
    }

    execute(context: Context) {
        throw new Error(`execute method needs overridden for base class Token`);
    }
}

export class Operator extends Token {
    public lhand: Token[];
    public rhand: Token[];

    constructor(
        mooToken: moo.Token,
        lhand: Token,
        rhand: Token) {
        super(mooToken);

        this.lhand = ensureArray(lhand);
        this.rhand = ensureArray(rhand);
    }

    execute(context: Context) {
        executeOperator(context, this.value, this.lhand, this.rhand);
    }

}

export class Value extends Token {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }
}

export class Identifier extends Value {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }
}

export class NumberConstant extends Value {
    constructor(mooToken: moo.Token) {
        super(mooToken);

        const valueToken = getAllTokens(this);
        valueToken[0].value = parseFloat(valueToken[0].value);
    }
}

export class StringConstant extends Value {
    constructor(mooToken: moo.Token) {
        super(mooToken);

        const valueToken = getAllTokens(this);
        valueToken[0].value = valueToken[0].value.replace(/^"(.*)"$/, '$1');
    }
}

export class BuiltInConstant extends Value {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }
}


function ensureArray(token: Token | Token[]) {
    if (token instanceof Array) {
        return token;
    } else {
        return [token];
    }
}

// function ensureNotArray(token: Token | Token[]) {
//     if (token instanceof Array) {
//         throw new Error(`An array of tokens was totally unexpected at this point`);
//     } else {
//         return token;
//     }
// }


function executeOperator(
    context: Context,
    operator: string,
    lhandArray: Token[],
    rhandArray: Token[]
) {
    switch (operator) {
        case '=':

            const lhand = getAllTokens(lhandArray);
            const rhand = getAllTokens(rhandArray);

            assert(lhand.length === 1, "executeOperator=: lhand.length === 1");
            assert(rhand.length === 1, "executeOperator=: rhand.length === 1");

            const identifier = lhand[0].value;
            const value = rhand[0].value;

            context.set(identifier, value);
            break;
        default:
    }
}


function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assert error: ${message} FAILED!`);
    }
}

function getAllTokens(ast: ScadTokens.Token | ScadTokens.Token[]): ScadTokens.Token[] {
    if (!Array.isArray(ast)) {
        return getAllTokens([ast]);
    }

    const tokenStream = cc.tokenFeeder(ast);
    const content: any = Array.from(tokenStream);

    if (!Array.isArray(content)) {
        return (<any>[content]);
    }
    return content;
}
