import { Context } from './context/context';
import { Logger } from "../logger/logger";
import * as TokenType from "../../compiler/runtime/token-type"

export class RunTime {
    source: string;
    private context: Context;
    logger: Logger;

    constructor(code: string) {
        this.source = code;

        this.logger = new Logger();
        this.context = new Context(null, this.logger);
    }

    getIdentifier(identifier: string) {
        return this.context.getIdentifier(identifier);
    }

    setIdentifier(identifier: string, value: TokenType.Value2) {
        this.context.setIdentifier(identifier, value);
    }
}
