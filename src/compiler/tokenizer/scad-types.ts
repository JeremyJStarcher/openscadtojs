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

function makeMooToken(value: any) {
    const ret: moo.Token = {
        value: value,
        offset: 0,
        size: 0,
        lineBreaks: false,
        line: 0,
        col: 0
    };
    return ret;
}

export class Evalutable extends Token {

}

export class Operator extends Evalutable {
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
        executeOperator(context, this);
    }
}

export class UnaryOperator extends Evalutable {
    public operand: Token[];

    constructor(
        mooToken: moo.Token,
        operand: Token
    ) {
        super(mooToken);

        this.operand = ensureArray(operand);
    }

    execute(context: Context) {
        executeOperator(context, this);
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
    constructor(value: moo.Token | number) {
        if (typeof value === "number") {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);
            const valueToken = getAllTokens(this);
            valueToken[0].value = parseFloat(valueToken[0].value);
        }
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

function executeOperator(
    context: Context,
    token: ScadTokens.Evalutable
): ScadTokens.Token {

    if (token instanceof ScadTokens.Operator) {
        return executeBinaryOperator(context, token);
    }

    if (token instanceof ScadTokens.UnaryOperator) {
        return executeUnaryOperator(context, token);
    }


    return token;
}

function executeUnaryOperator(
    context: Context,
    token: ScadTokens.UnaryOperator
): ScadTokens.Token {
    const operand = getAllTokens(token.operand);
    assert(operand.length === 1, "UnaryOperand length === 1");

    let operandToken = operand[0];

    if (operandToken instanceof ScadTokens.Evalutable) {
        operandToken = executeOperator(context, operandToken);
    }

    const operator = token.value;
    const oval = operandToken.value;

    let result = operandToken;
    switch (operator) {
        case '+':
            result = new ScadTokens.NumberConstant(+ oval);
            break;
        case '-':
            result = new ScadTokens.NumberConstant(- oval);
            break;
        default:
            throw new Error(`Unknown unary operator: ${operator}`)
    }

    return result;
}

function executeBinaryOperator(
    context: Context,
    token: ScadTokens.Operator
): ScadTokens.Token {


    const lhand = getAllTokens(token.lhand);
    const rhand = getAllTokens(token.rhand);

    assert(lhand.length === 1, "executeOperator=: lhand.length === 1");
    assert(rhand.length === 1, "executeOperator=: rhand.length === 1");

    let lhandToken = lhand[0];
    let rhandToken = rhand[0];

    if (lhandToken instanceof ScadTokens.Evalutable) {
        lhandToken = executeOperator(context, lhandToken);
    }

    if (rhandToken instanceof ScadTokens.Evalutable) {
        rhandToken = executeOperator(context, rhandToken);
    }

    const operator = token.value;
    const rval = rhandToken.value;
    const lval = lhandToken.value;

    //    console.log('Step2', 'op', token.value, "l", lval, "r", rval);


    let result = lhandToken;
    switch (operator) {
        case '=':
            context.set(lval, rval);
            break;
        case '+':
            result = new ScadTokens.NumberConstant(lval + rval);
            break;
        case '-':
            result = new ScadTokens.NumberConstant(lval - rval);
            break;
        case '*':
            result = new ScadTokens.NumberConstant(lval * rval);
            break;
        case '/':
            result = new ScadTokens.NumberConstant(lval / rval);
            break;
        default:
            throw new Error(`Unknown operator: ${operator}`)
    }

    return result;

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
