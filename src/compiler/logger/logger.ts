export class Logger {
    private errors: string[];
    private warnings: string[];
    private infos: string[];

    constructor() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
    }

    error(str: string) {
        this.errors.push(str);
    }

    warning(str: string) {
        this.warnings.push(str);
    }

    info(str: string) {
        this.infos.push(str);
    }

    getErrors() {
        return this.errors;
    }

    getWarnings() {
        return this.warnings;
    }

    getInfos() {
        return this.infos;
    }

}