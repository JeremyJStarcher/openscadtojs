import { Context } from '../cc/context/context';
import { runOp, runUnaryOp } from "./operators";
import * as TokenType from "./token-type";
import getAllTokens from "./getAllTokens";

export default function runToken(
    context: Context,
    token: TokenType.Evalutable
): TokenType.Token {

    if (token instanceof TokenType.UnaryOperator) {
        const ret = executeUnaryOperator(context, token);
        return ret;
    }

    if (token instanceof TokenType.Operator) {
        return executeBinaryOperator(context, token);
    }

    return token;
}

function executeUnaryOperator(
    context: Context,
    token: TokenType.UnaryOperator
): TokenType.Token {
    const operator = token;
    const operand = getAllTokens(token.operand);

    assert(operand.length === 1, "UnaryOperand length === 1");

    let operandToken = operand[0];

    if (operandToken instanceof TokenType.Evalutable) {
        operandToken = runToken(context, operandToken);
    }

    return runUnaryOp(context, operator.value, operandToken);
}

function executeBinaryOperator(
    context: Context,
    token: TokenType.Operator
): TokenType.Token {
    const lhand = getAllTokens(token.lhand);
    const rhand = getAllTokens(token.rhand);

    assert(lhand.length === 1, "executeOperator=: lhand.length === 1");
    assert(rhand.length === 1, "executeOperator=: rhand.length === 1");

    let lhandToken = lhand[0];
    let rhandToken = rhand[0];

    if (lhandToken instanceof TokenType.Evalutable) {
        lhandToken = runToken(context, lhandToken);
    }

    if (rhandToken instanceof TokenType.Evalutable) {
        rhandToken = runToken(context, rhandToken);
    }

    const operator = token.value;

    if (operator === "=") {
        context.set(lhandToken.value, rhandToken as TokenType.Value2);

    } else {
        return runOp(context, operator, lhandToken, rhandToken);
    }

    return TokenType.VALUE_UNDEFINED;
}


function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assert error: ${message} FAILED!`);
    }
}

