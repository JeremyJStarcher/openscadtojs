/*
 * Rational
 *
 * OpenSCAD's grammar will allow applying any operator to any token
 * type, but very few of those combinations actually make sense
 * at run-time.  Those that do not make sense return `undef`.
 *
 * So we allow registering operators, either in the form of
 * <operator> <lhand.type> <rhand.type>
 * <operator> <operand.type>
 *
 * If there is a valid function registered, evaluate the operator.
 * If not, return the default.
 */
import * as TokenType from "./token-type";
import { RunTime } from "../cc/run-time";


type hashLookupType = (
    runtime: RunTime,
    l: TokenType.Value2,
    r: TokenType.Value2
) => TokenType.Value2;

const operatorLookup: Map<string, hashLookupType> = new Map();

type hashUnaryLookupType = (
    o: TokenType.Value2,
) => TokenType.Value2;

const unaryOperatorLookup: Map<string, hashUnaryLookupType> = new Map();

export function runUnaryOp(
    runtime: RunTime,
    operator: string,
    operand: TokenType.Value2
) {
    initFuncs();
    const op = operand as TokenType.Value2;
    const hash = hashUnaryOp(operator, op.constructor.name);
    const func = unaryOperatorLookup.get(hash) || errorFallbackUnary;
    return func(operand);
}

export function runOp(
    runtime: RunTime,
    operator: string,
    lhand: TokenType.Value2,
    rhand: TokenType.Value2
) {
    initFuncs();
    const hash = hashOp(operator, lhand.constructor.name, rhand.constructor.name);
    const func = operatorLookup.get(hash) || errorFallback;
    return func(runtime, lhand, rhand);
}

function hashOp(
    operator: string,
    lhandType: string,
    rhandType: string
) {
    return [operator, lhandType, rhandType].join("::");
}

function hashUnaryOp(
    operator: string,
    operand: string,
) {
    return [operator, operand].join("::");
}

let wasInitRun = false;
function initFuncs() {
    if (wasInitRun) {
        return;
    }

    wasInitRun = true;

    const numberClassName = new TokenType.Number(10).constructor.name;
    const stringClassName = new TokenType.String("10").constructor.name;
    const booleanClassName = new TokenType.Boolean(true).constructor.name;
    const vectorClassName = new TokenType.Vector([]).constructor.name;

    /*
     *  NUMBERS MATH OPERATIONS
     */

    operatorLookup.set(hashOp("+", numberClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Number(lval.value + rval.value); }
    );

    operatorLookup.set(hashOp("-", numberClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Number(lval.value - rval.value); }
    );

    operatorLookup.set(hashOp("*", numberClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Number(lval.value * rval.value); }
    );

    operatorLookup.set(hashOp("/", numberClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Number(lval.value / rval.value); }
    );

    /*
     *   COMPARISONS
     */

    operatorLookup.set(hashOp("==", numberClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(lval.value === rval.value); }
    );

    operatorLookup.set(hashOp("==", numberClassName, stringClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", numberClassName, booleanClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", numberClassName, vectorClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", stringClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", stringClassName, booleanClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", stringClassName, vectorClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", stringClassName, stringClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(lval.value === rval.value); }
    );

    operatorLookup.set(hashOp("==", booleanClassName, stringClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", booleanClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", booleanClassName, vectorClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", booleanClassName, booleanClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(lval.value === rval.value); }
    );

    operatorLookup.set(hashOp("==", vectorClassName, vectorClassName),
        (runtime: RunTime, lval: TokenType.Vector, rval: TokenType.Vector) => { return new TokenType.Boolean(lval.toScadString(runtime) === rval.toScadString(runtime)); }
    );

    operatorLookup.set(hashOp("==", vectorClassName, numberClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", vectorClassName, stringClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    operatorLookup.set(hashOp("==", vectorClassName, booleanClassName),
        (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => { return new TokenType.Boolean(false); }
    );

    /*
     * UNARY NUMBERS
     */

    unaryOperatorLookup.set(hashUnaryOp("+", numberClassName),
        (operand: TokenType.Value2) => { return new TokenType.Number(+ operand.value); }
    );

    unaryOperatorLookup.set(hashUnaryOp("-", numberClassName),
        (operand: TokenType.Value2) => { return new TokenType.Number(- operand.value); }
    );
}

/*
 * FALLBACKS, just in case.
 */

const errorFallback = (runtime: RunTime, lval: TokenType.Value2, rval: TokenType.Value2) => TokenType.VALUE_UNDEFINED;
const errorFallbackUnary = (o: TokenType.Value2) => TokenType.VALUE_UNDEFINED;