import * as rules from './tokenizer';
import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';

export function deNest(val: moo.Token[] | moo.Token): moo.Token[] {
    let out: moo.Token[] = [];

    if (!val) {
        return val;
    }

    if (!Array.isArray(val)) {
        if (typeof val === "object") {
            const newObj: any = {};
            Object.keys(val).forEach(key => {
                newObj[key] = deNest(val[key]);
            });
            return newObj;
        }
        return val;
    }

    if (val.length === 1) {
        return deNest(val[0]);
    } else {

        val.forEach(v => {
            // Sometimes we get greebly empty arrays, maybe of whitespace or something.
            if (Array.isArray(v) && v.length === 0) {
                return;
            }
            const v2: any = deNest(v);
            out.push(v2);
        });

        const noNull = out.filter(p => p);
        return noNull;
    }
}

export function toCode(subtree: any): string {
    if (Array.isArray(subtree)) {
        const str = subtree.map(b => {
            return toCode(b);
        });
        return str.join(" ");
    } else {
        if (subtree.type === "number" || subtree.type === "identifier") {
            return subtree.value;
        }

        if (subtree.type === "operators") {
            const op = subtree.func;
            const v1 = toCode(subtree.lhand);
            const v2 = toCode(subtree.rhand);

            return `${op} (${v1}, ${v2})`
        }
        if (subtree.type === "eos") {
            return subtree.value;
        }
    }
    return "???" + JSON.stringify(subtree) + Array.isArray(subtree);
}

describe('Tokenizer Tests', () => {
    it('The tests run', () => {
        expect(true).toBe(true);
    });

    describe("moo", () => {
        function testSimpleTokens(
            testedValue: string,
            expectedType: string,
            expectedValue: string
        ) {
            const lexer = moo.compile(rules.OPENSCAD_RULES);
            lexer.reset(testedValue);
            const tokens: moo.Token[] = Array.from(<any>lexer);

            const token = tokens[0];

            if (!token) {
                expect(token).not.toBeNull();
                return;
            }
            expect(token.type).toBe(expectedType);
            expect(token.value).toBe(expectedValue);
        }

        describe("Parses strings properly", () => {
            it("Handles normal strings", () => {
                const testedValue = `"Normal String"`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it("String with embedded quote", () => {
                const testedValue = `"Normal \\"String\\""`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it("String with single character embedded", () => {
                const testedValue = `"Backslash \\\\ tab \\t newline\\n cr \\r"`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it("String with embedded unicode", () => {
                const testedValue = `"Omega \\u03a9"`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it("Doesn't greedly parse two strings", () => {
                testSimpleTokens(`"Hello" "World"`, "string", `"Hello"`);
            });
        });

        describe("Parses numbers properly", () => {
            //* These numbers have been tested in OpenSCAD
            //   and all parsed in their compilier.

            it("regular integers", () => {
                const testedValue = `123`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("leading decimal point", () => {
                const testedValue = `.123`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("trailing decimal point", () => {
                const testedValue = `123.`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("mid decimal point", () => {
                const testedValue = `1.23`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("mid decimal point", () => {
                const testedValue = `1.23`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("two decimal points - should split the number", () => {
                testSimpleTokens("1.2.3", "number", "1.2");
            });
            it("zero value", () => {
                const testedValue = `0`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("Scientific notation: 3.2e23", () => {
                const testedValue = `3.2e23`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("Scientific notation: 4.70e+9", () => {
                const testedValue = `4.70e+9`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("Scientific notation: 2E-4", () => {
                const testedValue = `2E-4`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("Scientific notation: 0003", () => {
                const testedValue = `0003`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("Scientific notation: 37.e88", () => {
                const testedValue = `37.e88`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
        });

        describe("Testing that operators parse correctly", () => {
            it("Verifying that operators are found by the longest first", () => {
                const lexer = moo.compile(rules.OPENSCAD_RULES);
                const ops = rules.OPENSCAD_RULES.operators as string[];
                const joiner = 'qq';

                ops.forEach((op) => {
                    const src = `1 ${op} 7`;
                    lexer.reset(src);

                    const tokens: moo.Token[] = Array.from(<any>lexer);
                    const importantTokens = tokens.filter(p => p.type !== "WS");
                    const compact = importantTokens.join(joiner);

                    expect(compact).toBe(`1${joiner}${op}${joiner}7`);
                });
            });
        });

        describe("Testing that identifiers parse correctly", () => {
            it("Verifying that identifiers parse", () => {
                const lexer = moo.compile(rules.OPENSCAD_RULES);
                const identifiers = ["a", "bb", "abc", "_abc", "$abc", "$abc123", "ABc", "abC", "Ab_3c"];


                identifiers.forEach((identifier) => {
                    lexer.reset(identifier);

                    const tokens: moo.Token[] = Array.from(<any>lexer);
                    expect(tokens[0].value).toBe(identifier);
                });

            });

            it("Verifying that bad identifers errror", () => {
                const lexer = moo.compile(rules.OPENSCAD_RULES);
                const identifiers = ["12a", "$"];


                identifiers.forEach((identifier) => {
                    lexer.reset(identifier);
                    let errorHappened = false;
                    try {
                        const tokens: moo.Token[] = Array.from(<any>lexer);
                        expect(tokens[0].value).not.toBe(identifier);
                        errorHappened = true;
                    } catch (err) {
                        errorHappened = true;
                    }
                    expect(errorHappened).toBeTruthy();
                });
            });

        });

    });

    describe('Testing nearly', () => {
        function generateAst(source: string) {
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
            parser.feed(source);
            const res = parser.results as [moo.Token[]];

            // console.log("===================================================");
            // console.log(JSON.stringify(res));

            // If the length == 0, there was no valid tree built.
            // if the length > 1, there is ambiguous grammar that can be parsed
            //   multiple ways.  Either condition is bad. 
            expect(res.length).toBe(1);
            return res;
        }

        function catchError(source: string, loc: any) {
            try {
                generateAst(source);
                fail(`[${source}] parsed correctly. It shouldn't have.`);
            } catch (err) {
                const token: any = err.token;
                if (token.line !== loc.line || token.col !== loc.col) {
                    fail(`[${source}] failed at ${token.line}, ${token.col}.  Expected failure at: ${loc.line}, ${loc.col}`);
                }
            }
        }

        it('Ensuring module loaded', () => {
            expect(nearley).not.toBeNull();
            expect(grammar).not.toBeNull();

        });

        it('parse simple assignments', () => {
            generateAst("line1=1;");
            generateAst("line2=2-1 ; ");
            generateAst("line3=bbba + 3; ");
            generateAst(`line4 = "Hellow" +"World"  ;`);
            generateAst(`line5 = "9"+ "a" ;`);
        });

        it('should fail assigning to a numeric constant', () => {
            catchError("1=1;", { line: 1, col: 2 });
        });

        it('should fail assigning to a string constant', () => {
            catchError(`"a"="b";`, { line: 1, col: 4 });
        });

        it('should fail assigning to a built-in constant', () => {
            catchError(`undef=undef;`, { line: 1, col: 6 });
        });


        it('parse complex assignments', () => {
            generateAst("line1 = (1 * 2);");
            generateAst("line1 = 1;");
            generateAst("line1 = 1 + 2 * 3;");
            generateAst("line2 = (1+3) * 4 * 5 / (2-1);");
        });

        it('parse multiple statements', () => {
            generateAst("line1=1;    ");
            generateAst("    line1=1;    ");
            generateAst("line1=1;line2=2;line3=3;");
            generateAst("line1 = 1;  line2 = 2;line3 =3;");
            generateAst("  line1 = 1;  line2 = 2;line3 =3;");
            generateAst("  line1 = 1;  line2 = 2;line3 =3;   ");
        });
    });
});