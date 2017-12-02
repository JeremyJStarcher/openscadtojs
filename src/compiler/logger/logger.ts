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
        this.logs.push(str);
    }

    echo(str: string) {
        this.logs.push('ECHO: ' + str);
    }

    getErrors() {
        return this.errors;
    }

    getLogs() {
        return this.logs;
    }
}