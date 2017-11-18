export class Logger {
    private errors: string[];
    private logs: string[];

    constructor() {
        this.errors = [];
        this.logs = [];
    }

    error(str: string) {
        this.errors.push(str);
    }

    warn(str: string) {
        this.logs.push('WARNING: ' + str);
    }

    log(str: string) {
        this.logs.push('LOG: ' + str);
    }

    getErrors() {
        return this.errors;
    }

    getLogs() {
        return this.logs;
    }
}