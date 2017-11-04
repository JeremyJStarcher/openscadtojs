 export class Tokenizer {
    private source: string;
    private offset: number;

    constructor(str: string) {
        this.source = str;
        this.offset = 0;
    }

    isEOS() {
        return this.offset === this.source.length;
    }
}
