export class Token {
    public toString: () => string;
    public type?: string;
    public value: string;
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
}

export class Operator extends Token {
    public lhand: Token[];
    public rhand: Token[];

    constructor(
        mooToken: moo.Token,
        lside: Token | Token[],
        rside: Token | Token[]) {
        super(mooToken);

        this.lhand = ensureArray(lside);
        this.rhand = ensureArray(rside);
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
    }
}

export class StringConstant extends Value {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }
}

export class BuiltInConstant extends Value {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }
}


function ensureArray(lside: Token | Token[]) {
    if (lside instanceof Array) {
        return lside;
    } else {
        return [lside];
    }
}
