import { Context } from '../cc/context/context';
import { RunTime } from '../cc/run-time';
import * as evaluate from '../../compiler/runtime/evaluate';

export class Token {
    public type: string | undefined;
    public value: any;
    public offset: number;
    public size: number;
    public lineBreaks: boolean;
    public line: number;
    public col: number;

    constructor(mooToken: moo.Token) {
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

    public toString() {
        return this.value;
    }

    public toScadString(runtime: RunTime): string {
        return this.value;
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

    valueOf(runtime: RunTime): Value2 {
        return this;
    }
}

export class Operator extends Value2 {
    public lhand: Value2;
    public rhand: Value2;

    constructor(
        mooToken: moo.Token,
        lhand: Value2,
        rhand: Value2) {
        super(mooToken);

        this.lhand = lhand;
        this.rhand = rhand;
    }

    valueOf(runtime: RunTime): Value2 {
        const ret = evaluate.executeBinaryOperator(runtime, this);
        return ret;
    }
}

export class UnaryOperator extends Value2 {
    public operand: Value2;

    constructor(
        mooToken: moo.Token | moo.Token[],
        operand: Value2
    ) {

        function getInnerValue(item: any | any[]): moo.Token {
            if (Array.isArray(item)) {
                if (item.length !== 1) {
                    console.error('Gack, getInnerValue');
                }
                return getInnerValue(item[0]);
            } else {
                return item;
            }
        }

        super(getInnerValue(mooToken));
        this.operand = operand;
    }

    valueOf(runtime: RunTime): Value2 {
        return evaluate.executeUnaryOperator(runtime, this);
    }
}

export class Identifier extends Value2 {
    constructor(mooToken: moo.Token) {
        super(mooToken);
    }

    valueOf(runtime: RunTime): Value2 {
        return runtime.getIdentifier(this.value);
    }
}

export class Number extends Value2 {
    public value: number;

    constructor(value: moo.Token | number) {
        if (typeof value === 'number') {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);
            this.value = parseFloat(value.value);
        }
    }

    public toScadString(): string {
        if (isNaN(this.value)) {
            return 'nan';
        }

        if (!isFinite(this.value)) {
            if (this.value < 0) {
                return '-inf';
            } else {
                return 'inf';
            }
        }

        return '' + this.value;
    }
}

export class Undefined extends Value2 {
    constructor() {
        const valueToken = makeMooToken(undefined);
        super(valueToken);
    }

    public toScadString(): string {
        return 'undef';
    }
}

export class String extends Value2 {
    public value: string;

    constructor(value: moo.Token | string) {
        if (typeof value === 'string') {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);
            this.value = ('' + this.value).slice(1, -1);
        }
    }

    public toScadString(): string {
        return `"${this.value}"`;
    }
}

export class Boolean extends Value2 {
    public value: boolean;

    constructor(value: moo.Token | boolean) {
        if (typeof value === 'boolean') {
            const valueToken = makeMooToken(value);
            super(valueToken);
        } else {
            super(value);

            this.value = value.value === 'true';
        }
    }
}

export class Vector extends Value2 {
    values: Value2[];

    constructor(value: moo.Token | any[], values?: Value2[]) {
        if (Array.isArray(value)) {
            const valueToken = makeMooToken(value);
            super(valueToken);
            values = value;
        } else {
            super(value);
            if (values) {
                this.values = values;
            }
        }
    }

    public toScadString(runtime: RunTime): string {
        const out2 = this.values.map(val => val.valueOf(runtime).toScadString(runtime));
        return `[` + out2.join(', ') + `]`;
    }
}

export class Range extends Value2 {
    start: Value2;
    step: Value2;
    end: Value2;
    styleTwoPart: boolean;

    constructor(value: moo.Token, values: Value2[]) {
        super(value);
        this.value = value;
        if (values.length === 3) {
            this.start = values[0];
            this.step = values[1];
            this.end = values[2];
            this.styleTwoPart = false;
        } else {
            this.start = values[0];
            this.step = new Number(1);
            this.end = values[1];
            this.styleTwoPart = true;
        }
    }

    valueOf(runtime: RunTime): Value2 {
        const _start = this.start.valueOf(runtime);
        const _step = this.step.valueOf(runtime);
        const _end = this.end.valueOf(runtime);

        if ((_start.value > _end.value) && this.styleTwoPart) {
            runtime.logger.warn('DEPRECATED: Using ranges of the form [begin:end] with begin value greater than the end value is deprecated.');
            return new Range(this.value, [_end, _step, _start]);
        } else {
            return this;
        }
    }

    public toScadString(runtime: RunTime): string {
        const valOf = this.valueOf(runtime) as Range;
        const out2 = [valOf.start, valOf.step, valOf.end].map(val => val.valueOf(runtime).toScadString(runtime));
        return `[` + out2.join(' : ') + `]`;
    }
}

export class ModuleCall extends Token {
    public arguments: Value2[];

    constructor(value: moo.Token, args: Token[]) {
        super(value);
        this.arguments = args as Value2[];
    }
}

export class FunctionDefinition extends Token {
    public arguments: Value2[];
    public returnValue: Value2;

    constructor(value: moo.Token, args: Value2[], returnValue: Value2) {
        super(value);
        this.arguments = args;
        this.returnValue = returnValue;
    }
}

export class IfStatement extends Token {
    public condition: Value2;
    public iftrue: Token;
    public iffalse: Token | null;

    constructor(value: moo.Token, condition: Value2, ift: Token, iff: Token | null) {
        super(value);

        this.condition = condition;
        this.iftrue = ift;
        this.iffalse = iff;
    }
}

export class ModuleDefinition extends Token {
    public arguments: Value2[];
    public code: Token;
    public name: string;

    constructor(value: moo.Token, name: moo.Token, args: Value2[], code: Token) {
        super(value);
        this.name = name.value;
        this.arguments = args;
        this.code = code;
    }
}



export const VALUE_UNDEFINED = new Undefined();