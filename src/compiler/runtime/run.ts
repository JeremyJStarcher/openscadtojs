import { runOp, runUnaryOp } from "./operators";
import * as TokenType from "./token-type";
import { RunTime } from "../cc/run-time";
// import * as cc from "../../compiler/cc/cc";

export default function executeAssignment(
    runtime: RunTime,
    token: TokenType.Operator
) {
    const operator = token.value;

    let lhandToken = token.lhand;
    let rhandToken = token.rhand;

    if (lhandToken instanceof TokenType.Evalutable) {
        lhandToken = valueOfExpression(runtime, lhandToken);
    }

    if (rhandToken instanceof TokenType.Evalutable) {
        rhandToken = valueOfExpression(runtime, rhandToken);
    }

    if (operator === "=") {
        if (rhandToken.type === "identifier") {
            rhandToken = runtime.getIdentifier(rhandToken.value);
        }

        runtime.setIdentifier(token.lhand.value, rhandToken as TokenType.Value2);
    }
}


export function valueOfExpression(
    runtime: RunTime,
    token: TokenType.Evalutable
): TokenType.Value2 {

    if (token instanceof TokenType.UnaryOperator) {
        return executeUnaryOperator(runtime, token);
    }

    if (token instanceof TokenType.Operator) {
        return executeBinaryOperator(runtime, token);
    }

    if (token instanceof TokenType.Value2) {
        return token;
    }
    throw new Error(`runToken does not know how to handle statement: ${token.value}`);
}

function executeUnaryOperator(
    runtime: RunTime,
    token: TokenType.UnaryOperator
): TokenType.Value2 {
    const operator = token;
    const operand = token.operand;

    let operandToken = operand;

    if (operandToken instanceof TokenType.Value2) {
        operandToken = valueOfExpression(runtime, operandToken);
    }

    return runUnaryOp(runtime, operator.value, operandToken);
}

function executeBinaryOperator(
    runtime: RunTime,
    token: TokenType.Operator
): TokenType.Value2 {

    let lhandToken = token.lhand;
    let rhandToken = token.rhand;

    if (lhandToken instanceof TokenType.Evalutable) {
        lhandToken = valueOfExpression(runtime, lhandToken);
    }

    if (rhandToken instanceof TokenType.Evalutable) {
        rhandToken = valueOfExpression(runtime, rhandToken);
    }

    const operator = token.value;

    if (lhandToken.type === "identifier") {
        lhandToken = runtime.getIdentifier(lhandToken.value);
    }

    if (rhandToken.type === "identifier") {
        rhandToken = runtime.getIdentifier(rhandToken.value);
    }

    return runOp(runtime, operator, lhandToken, rhandToken);
}
