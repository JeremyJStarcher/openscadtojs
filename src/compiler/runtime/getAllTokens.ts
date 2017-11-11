import * as TokenType from "./token-type";
import * as cc from "../cc/cc";


export default function getAllTokens(
    ast: TokenType.Token | TokenType.Token[]
): TokenType.Token[] {
    if (!Array.isArray(ast)) {
        return getAllTokens([ast]);
    }

    const tokenStream = cc.tokenFeeder(ast);
    const content: any = Array.from(tokenStream);

    if (!Array.isArray(content)) {
        return (<any>[content]);
    }
    return content;
}
