import { Context } from '../cc/context/context';
import { VALUE_TYPE } from "./operators";
import getAllTokens from "./getAllTokens";

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

}

export class Identifier extends Value2 {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }

    getType(): VALUE_TYPE {
        return this.getType();
    }
}

export class Number extends Value2 {
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

export class Undefined extends Value2 {
    constructor() {
        const valueToken = makeMooToken(undefined);
        super(valueToken);
    }

    getType() {
        return VALUE_TYPE.UNDEFINED;
    }
}

export class String extends Value2 {
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

export const VALUE_UNDEFINED = new Undefined();