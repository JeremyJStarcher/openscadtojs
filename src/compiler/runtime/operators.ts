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

export enum VALUE_TYPE {
    NOT_IMP,
    NUMBER,
    STRING,
    UNDEFINED
}

type hashLookupType = (
    l: TokenType.Token,
    r: TokenType.Token
) => TokenType.Token;

const operatorLookup: Map<string, hashLookupType> = new Map();

type hashUnaryLookupType = (
    o: TokenType.Token,
) => TokenType.Token;

const unaryOperatorLookup: Map<string,hashUnaryLookupType> = new Map();

export function runUnaryOp(
    operator: string,
    operand: TokenType.Token
){
    const op = operand as TokenType.Value2;
    const hash = hashUnaryOp(operator, op.getType());
    const func = unaryOperatorLookup.get(hash) || errorFallbackUnary
    return func(operand);    
}
    
export function runOp(
    operator: string,
    lhand: TokenType.Token,
    rhand: TokenType.Token
) {
    const l = lhand as TokenType.Value2;
    const r = rhand as TokenType.Value2;

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
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value + rval.value); }
);

operatorLookup.set(hashOp("-", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value - rval.value); }
);

operatorLookup.set(hashOp("*", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value * rval.value); }
);

operatorLookup.set(hashOp("/", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: TokenType.Token, rval: TokenType.Token) => { return new TokenType.Number(lval.value / rval.value); }
);

/*
 * UNARY NUMBERS
 */

unaryOperatorLookup.set(hashUnaryOp("+", VALUE_TYPE.NUMBER),
    (operand: TokenType.Token) => { return new TokenType.Number(+ operand.value); }
);

unaryOperatorLookup.set(hashUnaryOp("-", VALUE_TYPE.NUMBER),
    (operand: TokenType.Token) => { return new TokenType.Number(- operand.value); }
);

/*
 * FALLBACKS, just in case.
 */

const errorFallback = (lval: TokenType.Token, rval: TokenType.Token) => TokenType.VALUE_UNDEFINED;
const errorFallbackUnary = (o: TokenType.Token) => TokenType.VALUE_UNDEFINED;