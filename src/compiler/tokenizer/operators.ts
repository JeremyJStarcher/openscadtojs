import {
    Token,
    NumberConstant,
    Value2,
    VALUE_UNDEFINED
} from "./scad-types";

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


const types: Map<string, hashLookupType> = new Map();

export function runOp(
    operator: string,
    lhand: Token,
    rhand: Token
) {
    debugger;
    const l = lhand as Value2;
    const r = rhand as Value2;

    const hash = hashOp(operator, l.getType(), r.getType());
    const func = types.get(hash) || errorFallback
    return func(lhand, rhand);
}

function hashOp(operator: string,
    lhandType: VALUE_TYPE,
    rhandType: VALUE_TYPE
) {
    return [operator, lhandType, rhandType].join("::");
}


types.set(hashOp("+", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value + rval.value); }
);

types.set(hashOp("-", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value - rval.value); }
);

types.set(hashOp("*", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value * rval.value); }
);

types.set(hashOp("/", VALUE_TYPE.NUMBER, VALUE_TYPE.NUMBER),
    (lval: Token, rval: Token) => { return new NumberConstant(lval.value / rval.value); }
);

export const errorFallback = (lval: Token, rval: Token) => VALUE_UNDEFINED;
