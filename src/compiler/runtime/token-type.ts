import { Context } from '../cc/context/context';
import { VALUE_TYPE } from "./value-type";


export class Token {
    public toString: () => string;
    public type: string | undefined;
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

export class CompoundStatement extends Token {
    public statements: Token[];

    constructor(mooToken: moo.Token, statements: Token[]) {
        super(mooToken);

        this.statements = statements;
    }
}

export class Value2 extends Evalutable {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }

    getType(): VALUE_TYPE {
        const type = typeof this.value;

        switch (type) {
            case "number":
                return VALUE_TYPE.NUMBER;
            case "undefined":
                return VALUE_TYPE.UNDEFINED;
            case "string":
                return VALUE_TYPE.STRING;
            case "boolean":
                return VALUE_TYPE.BOOLEAN;
        }

        return VALUE_TYPE.NOT_IMP;
    }
}

export class Operator extends Value2 {
    public lhand: Token;
    public rhand: Token;

    constructor(
        mooToken: moo.Token,
        lhand: Token,
        rhand: Token) {
        super(mooToken);

        this.lhand = lhand;
        this.rhand = rhand;
    }
}

export class UnaryOperator extends Value2 {
    public operand: Token;

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
        this.operand = operand;
    }

}

export class Identifier extends Value2 {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }
}

export class Number extends Value2 {
    constructor(value: moo.Token | number) {
        if (typeof value === "number") {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);

            this.value = parseFloat(value.value);
        }
    }
}

export class Undefined extends Value2 {
    constructor() {
        const valueToken = makeMooToken(undefined);
        super(valueToken);
    }
}

export class String extends Value2 {
    constructor(value: moo.Token | string) {
        if (typeof value === "string") {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);
            this.value = "" + this.value;
        }
    }
}

export class Boolean extends Value2 {
    constructor(value: moo.Token | boolean) {
        if (typeof value === "boolean") {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);

            this.value = this.value === "true";
        }
    }
}


export class Module extends Value2 {

    public arguments: Token[];


    constructor(value: moo.Token, args: Token[]) {
        super(value);

        const argsContainer = args;

        const realArgsIndent = argsContainer.filter(t => {

            const argumentToken = t;

            if (typeof argumentToken !== "object") {
                return false;
            }

            if (argumentToken.type === "argument_separator") {
                return false;
            }

            return true;
        });

        const cleanArgs = realArgsIndent.map(ra => ra);
        this.arguments = cleanArgs;

    }
}

export const VALUE_UNDEFINED = new Undefined();