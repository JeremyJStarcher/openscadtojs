import { Logger } from "../../logger/logger";
import * as ScadTokens from "../../tokenizer/scad-types";


export interface IContext {
    parent: IContext;
    set: (key: string, value: ScadTokens.Value2) => void;
    get: (key: string) => ScadTokens.Value2;
}

export class Context {
    private parent: Context | null;
    private container: Map<string, ScadTokens.Value2>;
    private logger: Logger;

    constructor(
        parent: Context | null,
        logger: Logger
    ) {
        this.parent = parent;
        this.container = new Map();
        this.logger = logger;
    }

    set(key: string, value: ScadTokens.Value2) {
        if (!(value instanceof ScadTokens.Value2)) {
            throw new Error(`Context Set: Attempted to set non ScadToken value type`);
        }
        this.container.set(key, value);
    }

    get(key: string): ScadTokens.Value2 {
        if (this.container.has(key)) {
            const val = this.container.get(key) as ScadTokens.Value2;
            return val;
        }
        if (this.parent) {
            return this.parent.get(key);
        }
        this.logger.warn(`Ignoring unknown variable '${key}'.`);
        return new ScadTokens.UndefinedConstant();
    }
}
