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

import {
    Token,
    NumberConstant,
    Value2,
    VALUE_UNDEFINED
} from "./tokens";

export enum VALUE_TYPE {
    NOT_IMP,
    NUMBER,
    STRING,
    UNDEFINED
}

type hashLookupType = (
    l: Token,
    r: Token
) => Token;

const operatorLookup: Map<string, hashLookupType> = new Map();

type hashUnaryLookupType = (
    o: Token,
) => Token;

const unaryOperatorLookup: Map<string,hashUnaryLookupType> = new Map();

export function runUnaryOp(
    operator: string,
    operand: Token
){
    const op = operand as Value2;
    const hash = hashUnaryOp(operator, op.getType());
    const func = unaryOperatorLookup.get(hash) || errorFallbackUnary
    return func(operand);    
}
    
export function runOp(
    operator: string,
    lhand: Token,
    rhand: Token
) {
    const l = lhand as Value2;
    const r = rhand as Value2;

    const hash = hashOp(operator, l.getType(), r.getType());
    const func = operatorLookup.get(hash) || errorFallback
    return func(lhand, rhand);
}

function hashOp(operator: string,
    lhandType: VALUE_TYPE,
    rhandType: VALUE_TYPE
) {
    return [operator, lhandType, rhandType].join("::");
}

function hashUnaryOp(operator: string,
    operand: VALUE_TYPE,
) {
    return [operator, operand].join("::");
}

/*
 *  NUMBERS
 */

operatorLookup.set(hashOp("+", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value + rval.value); }
);

operatorLookup.set(hashOp("-", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value - rval.value); }
);

operatorLookup.set(hashOp("*", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value * rval.value); }
);

operatorLookup.set(hashOp("/", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value / rval.value); }
);

/*
 * UNARY NUMBERS
 */

unaryOperatorLookup.set(hashUnaryOp("+", VALUE_TYPE.NUMBER),
    (operand: Token) => { return new NumberConstant(+ operand.value); }
);

unaryOperatorLookup.set(hashUnaryOp("-", VALUE_TYPE.NUMBER),
    (operand: Token) => { return new NumberConstant(- operand.value); }
);



export const errorFallback = (lval: Token, rval: Token) => VALUE_UNDEFINED;
export const errorFallbackUnary = (o: Token) => VALUE_UNDEFINED;