import { Logger } from "../../logger/logger";
import * as TokenType from "../../runtime/token-type";


export interface IContext {
    parent: IContext;
    set: (key: string, value: TokenType.Value2) => void;
    get: (key: string) => TokenType.Value2;
}

export class Context {
    private parent: Context | null;
    private container: Map<string, TokenType.Value2>;
    private logger: Logger;

    constructor(
        parent: Context | null,
        logger: Logger
    ) {
        this.parent = parent;
        this.container = new Map();
        this.logger = logger;
    }

    set(key: string, value: TokenType.Value2) {
        if (!(value instanceof TokenType.Value2)) {
            debugger;
            const msg = `Context Set: Attempted to set non ScadToken value type`;
            console.error(msg);
            throw new Error(msg);

        }
        this.container.set(key, value);
    }

    get(key: string): TokenType.Value2 {
        if (this.container.has(key)) {
            const val = this.container.get(key) as TokenType.Value2;
            return val;
        }
        if (this.parent) {
            return this.parent.get(key);
        }
        this.logger.warn(`Ignoring unknown variable '${key}'.`);
        return new TokenType.Undefined();
    }
}
