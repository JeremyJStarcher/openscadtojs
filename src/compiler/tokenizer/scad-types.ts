import { Context } from '../cc/context/context';
import * as cc from "../cc/cc";
import { VALUE_TYPE, runOp, runUnaryOp } from "./operators";

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

export class Value2 extends Evalutable {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }

    getType(): VALUE_TYPE {
        return VALUE_TYPE.NOT_IMP;
    }
}

export class Operator extends Value2 {
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

export class UnaryOperator extends Value2 {
    public operand: Token[];

    constructor(
        mooToken: moo.Token | moo.Token[],
        operand: Token
    ) {

        function getInnerValue(item: any | any[]): moo.Token {
            if (Array.isArray(item)) {
                if (item.length !== 1) {
                    console.error("Gack, getInnerValue");
                }
                return getInnerValue(item[0]);
            } else {
                return item;
            }
        }


        super(getInnerValue(mooToken));
        this.operand = ensureArray(operand);
    }


    execute(context: Context) {
        executeOperator(context, this);
    }
}

export class Identifier extends Value2 {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }

    getType(): VALUE_TYPE {
        return this.getType();
    }
}

export class NumberConstant extends Value2 {
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

    getType() {
        return VALUE_TYPE.NUMBER;
    }
}

export class UndefinedConstant extends Value2 {
    constructor() {
        const valueToken = makeMooToken(undefined);
        super(valueToken);
    }

    getType() {
        return VALUE_TYPE.UNDEFINED;
    }
}

export class StringConstant extends Value2 {
    constructor(value: moo.Token | string) {
        if (typeof value === "string") {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);
            const valueToken = getAllTokens(this);
            valueToken[0].value = parseFloat(valueToken[0].value);
        }
    }

    getType() {
        return VALUE_TYPE.STRING;
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
    token: Evalutable
): Token {

    if (token instanceof UnaryOperator) {
        const ret = executeUnaryOperator(context, token);
        return ret;
    }

    if (token instanceof Operator) {
        return executeBinaryOperator(context, token);
    }

    return token;
}

function executeUnaryOperator(
    context: Context,
    token: UnaryOperator
): Token {
    const operator = token;
    const operand = getAllTokens(token.operand);

    assert(operand.length === 1, "UnaryOperand length === 1");

    let operandToken = operand[0];

    if (operandToken instanceof Evalutable) {
        operandToken = executeOperator(context, operandToken);
    }

    return runUnaryOp(operator.value, operandToken);
}

function executeBinaryOperator(
    context: Context,
    token: Operator
): Token {
    const lhand = getAllTokens(token.lhand);
    const rhand = getAllTokens(token.rhand);

    assert(lhand.length === 1, "executeOperator=: lhand.length === 1");
    assert(rhand.length === 1, "executeOperator=: rhand.length === 1");

    let lhandToken = lhand[0];
    let rhandToken = rhand[0];

    if (lhandToken instanceof Evalutable) {
        lhandToken = executeOperator(context, lhandToken);
    }

    if (rhandToken instanceof Evalutable) {
        rhandToken = executeOperator(context, rhandToken);
    }

    const operator = token.value;

    if (operator === "=") {
        context.set(lhandToken.value, rhandToken as Value2);

    } else {
        return runOp(operator, lhandToken, rhandToken);
    }

    return VALUE_UNDEFINED;
}


function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assert error: ${message} FAILED!`);
    }
}

function getAllTokens(ast: Token | Token[]): Token[] {
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


export const VALUE_UNDEFINED = new UndefinedConstant();