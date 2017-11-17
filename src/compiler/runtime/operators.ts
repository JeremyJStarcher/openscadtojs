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
    l: TokenType.Token,
    r: TokenType.Token
) => TokenType.Token;

const operatorLookup: Map<string, hashLookupType> = new Map();

type hashUnaryLookupType = (
    o: TokenType.Token,
) => TokenType.Token;

const unaryOperatorLookup: Map<string, hashUnaryLookupType> = new Map();

export function runUnaryOp(
    runtime: RunTime,
    operator: string,
    operand: TokenType.Value2
) {
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
    const hash = hashOp(operator, lhand.constructor.name, lhand.constructor.name);
    const func = operatorLookup.get(hash) || errorFallback;
    return func(lhand, rhand);
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

const numberClassName = new TokenType.Number(10).constructor.name;

/*
 *  NUMBERS
 */

operatorLookup.set(hashOp("+", numberClassName, numberClassName),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value + rval.value); }
);

operatorLookup.set(hashOp("-", numberClassName, numberClassName),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value - rval.value); }
);

operatorLookup.set(hashOp("*", numberClassName, numberClassName),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value * rval.value); }
);

operatorLookup.set(hashOp("/", numberClassName, numberClassName),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value / rval.value); }
);

/*
 * UNARY NUMBERS
 */

unaryOperatorLookup.set(hashUnaryOp("+", numberClassName),
    (operand: TokenType.Token) => { return new TokenType.Number(+ operand.value); }
);

unaryOperatorLookup.set(hashUnaryOp("-", numberClassName),
    (operand: TokenType.Token) => { return new TokenType.Number(- operand.value); }
);

/*
 * FALLBACKS, just in case.
 */

const errorFallback = (lval: TokenType.Token, rval: TokenType.Token) => TokenType.VALUE_UNDEFINED;
const errorFallbackUnary = (o: TokenType.Token) => TokenType.VALUE_UNDEFINED;