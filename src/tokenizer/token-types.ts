
interface IScadValue extends moo.Token {

}

interface IScadOperator extends moo.Token {
    type: "operator";
    lhand: moo.Token | moo.Token[];
    rhand: moo.Token | moo.Token[];
    func: string;
}
