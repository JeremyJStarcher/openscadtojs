import { Logger } from "../../logger/logger";
import * as TokenType from "../../runtime/token-type";

enum NAME_SPACE {
    IDENTIFIER = "IDENTIFIER",
}

export interface IContext {
    parent: IContext;
    set: (key: string, value: TokenType.Value2) => void;
    get: (key: string) => TokenType.Value2;
}

let contextId = 0;

export class Context {
    private parent: Context | null;
    private container: Map<string, TokenType.Value2>;
    private logger: Logger;
    private contextId: string;

    constructor(
        parent: Context | null,
        logger: Logger
    ) {
        this.parent = parent;
        this.container = new Map();
        this.logger = logger;
        this.contextId = "" + contextId;
        contextId++;
    }

    getContextId() {
        return this.contextId;
    }

    setIdentifier(key: string, value: TokenType.Value2) {
        const hash = this.getHash(key, NAME_SPACE.IDENTIFIER);
        this.set(hash, value);
    }

    getIdentifier(key: string): TokenType.Value2 {
        const hash = this.getHash(key, NAME_SPACE.IDENTIFIER);
        return this.get(hash);
    }

    private getHash(key: string, ns: NAME_SPACE) {
        const hash = ns + "_" + key;
        return hash;
    }

    private set(key: string, value: TokenType.Value2) {
        if (!(value instanceof TokenType.Value2)) {
            const msg = `Context Set: Attempted to set non ScadToken value type`;
            console.error(msg);
            throw new Error(msg);
        }

        if (!typeof value.getType) {
            const msg = `Context Set: attempted to set a value with no 'getType`;
            console.error(msg);
            throw new Error(msg);
        }
        this.container.set(key, value);
    }

    private get(key: string): TokenType.Value2 {
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
