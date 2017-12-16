import { Logger } from '../../logger/logger';
import * as TokenType from '../../runtime/token-type';

enum NAME_SPACE {
    IDENTIFIER = 'IDENTIFIER',
    MODULE = 'MODULE'
}

const HASHER = '_';


export interface IContext {
    parent: IContext;
    set: (key: string, value: TokenType.Value2) => void;
    get: (key: string) => TokenType.Value2;
}

let contextId = 0;

export class Context {
    private parent: Context | null;
    private container: Map<string, any>;
    private logger: Logger;
    private contextId: string;

    constructor(
        parent: Context | null,
        logger: Logger
    ) {
        this.parent = parent;
        this.container = new Map();
        this.logger = logger;
        this.contextId = '' + contextId;
        contextId++;
    }

    getContextId() {
        return this.contextId;
    }

    setIdentifier(key: string, value: TokenType.Identifier) {
        const hash = this.getHash(key, NAME_SPACE.IDENTIFIER);
        this.set(hash, value);
    }

    getIdentifier(key: string) {
        const hash = this.getHash(key, NAME_SPACE.IDENTIFIER);
        const token = this.get(hash, 'variable');
        if (token instanceof TokenType.Value2) {
            return token as TokenType.Identifier;
        }
        throw new Error('Context.getIdentifier tried to rturn a bad token');
    }

    setModule(key: string, value: TokenType.ModuleDefinition | Function) {
        const hash = this.getHash(key, NAME_SPACE.MODULE);
        this.set(hash, value);
    }

    getModule(key: string) {
        const hash = this.getHash(key, NAME_SPACE.MODULE);
        return this.get(hash, 'module') as TokenType.ModuleDefinition | Function;
    }

    private getHash(key: string, ns: NAME_SPACE) {
        const hash = ns + HASHER + key;
        return hash;
    }

    private set(key: string, value: any) {
        this.container.set(key, value);
    }

    private get(key: string, type: string): any {
        if (this.container.has(key)) {
            const val = this.container.get(key);
            return val;
        }
        if (this.parent) {
            return this.parent.get(key, type);
        }

        const name = key.split(HASHER)[1];
        this.logger.warn(`WARNING: Ignoring unknown ${type} '${name}'.`);
        return new TokenType.Undefined();
    }
}