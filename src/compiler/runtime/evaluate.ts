import { runOp, runUnaryOp } from './operators';
import * as TokenType from './token-type';
import { RunTime } from '../cc/run-time';

export function executeAssignment(
    runtime: RunTime,
    token: TokenType.Operator
) {
    const operator = token.value;
    const rhandToken = token.rhand.valueOf(runtime);

    if (operator === '=') {
        runtime.setIdentifier(token.lhand.value, rhandToken as TokenType.Value2);
    } else {
        throw new Error(`executeAssignment called but the token was ${token}`);
    }
}

export function executeUnaryOperator(
    runtime: RunTime,
    token: TokenType.UnaryOperator
): TokenType.Value2 {
    const operator = token;
    const operand = token.operand;

    const operandToken = operand.valueOf(runtime);
    return runUnaryOp(runtime, operator.value, operandToken);
}

export function executeBinaryOperator(
    runtime: RunTime,
    token: TokenType.Operator
): TokenType.Value2 {
    const lhandToken = token.lhand.valueOf(runtime);
    const rhandToken = token.rhand.valueOf(runtime);
    const operator = token.value;

    const ret = runOp(runtime, operator, lhandToken, rhandToken);
    return ret;
}
