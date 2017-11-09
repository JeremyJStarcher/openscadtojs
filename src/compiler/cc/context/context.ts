import {Logger} from "../../logger/logger";

export type ContextType = number | string | undefined;

export interface IContext {
    parent: IContext;
    set: (key: string, value: ContextType) => void;
    get: (key: string) => ContextType;
}

export class Context {
    private parent: Context | null;
    private container: Map<string, ContextType>;
    private logger: Logger;

    constructor(
        parent: Context | null,
        logger: Logger
    ) {
        this.parent = parent;
        this.container = new Map();
        this.logger = logger;
    }

    set(key: string, value: ContextType) {
        this.container.set(key, value);
    }

    get(key: string): ContextType {
        if (this.container.has(key)) {
            return this.container.get(key);
        }
        if (this.parent) {
            this.logger.warn(`Ignoring unknown variable '${key}'.`);
            return this.parent.get(key);
        }
        return undefined;
    }
}
