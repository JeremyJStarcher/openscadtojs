import { runOp, runUnaryOp } from "./operators";
import * as TokenType from "./token-type";
import { RunTime } from "../cc/run-time";


export default function runToken(
    runtime: RunTime,
    token: TokenType.Evalutable
): TokenType.Token {

    if (token instanceof TokenType.UnaryOperator) {
        const ret = executeUnaryOperator(runtime, token);
        return ret;
    }

    if (token instanceof TokenType.Operator) {
        return executeBinaryOperator(runtime, token);
    }

    return token;
}

function executeUnaryOperator(
    runtime: RunTime,
    token: TokenType.UnaryOperator
): TokenType.Token {
    const operator = token;
    const operand = token.operand;

    let operandToken = operand;

    if (operandToken instanceof TokenType.Evalutable) {
        operandToken = runToken(runtime, operandToken);
    }

    return runUnaryOp(runtime, operator.value, operandToken);
}

function executeBinaryOperator(
    runtime: RunTime,
    token: TokenType.Operator
): TokenType.Token {

    let lhandToken = token.lhand;
    let rhandToken = token.rhand;


    if (lhandToken instanceof TokenType.Evalutable) {
        lhandToken = runToken(runtime, lhandToken);
    }

    if (rhandToken instanceof TokenType.Evalutable) {
        rhandToken = runToken(runtime, rhandToken);
    }


    const operator = token.value;

    if (operator === "=") {
        if (rhandToken.type === "identifier") {
            rhandToken = runtime.getIdentifier(rhandToken.value);
        }

        runtime.setIdentifier(token.lhand.value, rhandToken as TokenType.Value2);
    } else {

        if (lhandToken.type === "identifier") {
            lhandToken = runtime.getIdentifier(lhandToken.value);
        }

        if (rhandToken.type === "identifier") {
            rhandToken = runtime.getIdentifier(rhandToken.value);
        }

        return runOp(runtime, operator, lhandToken, rhandToken);
    }

    return TokenType.VALUE_UNDEFINED;
}
