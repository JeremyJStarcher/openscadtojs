import { Context } from './context/context';
import { Logger } from "../logger/logger";
import * as TokenType from "../../compiler/runtime/token-type"




export class RunTime {
    source: string;
    // private context: Context;
    logger: Logger;
    allContexts: { [id: string]: Context } = {};
    contextStack: Context[];

    constructor(code: string) {
        this.source = code;
        this.logger = new Logger();
        const baseContext = this.createNewContext(null);
        this.contextStack.push(baseContext);
    }

    createNewContext(parent: Context | null) {
        const context = new Context(parent, this.logger);
        this.allContexts[context.getContextId()] = context;
        return context;
    }

    private currentGetCurrentContext() {
        return this.contextStack[this.contextStack.length - 1];
    }

    getIdentifier(identifier: string) {
        return this.currentGetCurrentContext().getIdentifier(identifier);
    }

    setIdentifier(identifier: string, value: TokenType.Value2) {
        this.currentGetCurrentContext().setIdentifier(identifier, value);
    }
}
