import { Context } from './context/context';
import { Logger } from "../logger/logger";
import * as TokenType from "../../compiler/runtime/token-type"

import ModuleEcho from "../../compiler/runtime/modules/echo";
import ModuleCube from "../../compiler/runtime/modules/cube";

export interface IModuleCall {
    context: Context;
    function: Function;
    arguments: TokenType.Value2[];
}

export class RunTime {
    private source: string;
    private allContexts: { [id: string]: Context } = {};
    private contextStack: Context[];
    public currentContext: Context;

    logger: Logger;
    geometryList: IModuleCall[];

    constructor(code: string) {
        this.source = code;
        this.logger = new Logger();
        const baseContext = this.createNewContext(null);
        this.contextStack = [];
        this.geometryList = [];

        this.contextStack.push(baseContext);

        baseContext.setModule('echo', ModuleEcho);
        baseContext.setModule('cube', ModuleCube);
    }

    getSource() {
        return this.source;
    }

    createNewContext(parent: Context | null) {
        const context = new Context(parent, this.logger);
        this.allContexts[context.getContextId()] = context;
        return context;
    }

    currentGetCurrentContext() {
        if (this.currentContext) {
            return this.currentContext;
        }
        return this.contextStack[this.contextStack.length - 1];
    }

    getIdentifier(identifier: string) {
        return this.currentGetCurrentContext().getIdentifier(identifier);
    }

    setIdentifier(identifier: string, value: TokenType.Value2) {
        this.currentGetCurrentContext().setIdentifier(identifier, value);
    }

    getModule(identifier: string) {
        return this.currentGetCurrentContext().getModule(identifier);
    }

    setModule(identifier: string, value: TokenType.Value2 | Function) {
        this.currentGetCurrentContext().setModule(identifier, value);
    }
}
