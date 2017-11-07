interface IScadToken {
    scadType: "unknownToken" | "constant";
    toString(): string;
    type?: string;
    value: string;
    offset: number;
    size: number;
    lineBreaks: boolean;
    line: number;
    col: number;
}



interface IScadConstant extends moo.Token {
    scadType: "constant";    
}

interface IScadOperator extends moo.Token {
    type: "operator";
    lhand: moo.Token | moo.Token[];
    rhand: moo.Token | moo.Token[];
    func: string;
}
