import * as rules from './tokenizer';
import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';

// declare function require(path: string): any;
// declare function since(text:string):void;

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

        if (subtree.type === "operator") {
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

    function generateParseTree(source: string): moo.Token[] {
        (<any>rules.OPENSCAD_RULES).myError = { match: /[\$?`]/, error: true };

        const lexer = moo.compile(rules.OPENSCAD_RULES);
        lexer.reset(source);
        const tokens: moo.Token[] = Array.from(<any>lexer);

        if ((<any>tokens[0]).type === "myError") {
            throw tokens[0];
        }
        return tokens;
    }

    function catchParseError(source: string, loc: any) {
        try {
            generateParseTree(source);
            fail(`[${source}] parsed correctly. It shouldn't have.`);
        } catch (err) {
            const token: any = err;
            if (token.line !== loc.line || token.col !== loc.col) {
                fail(`[${source}] failed at ${token.line}, ${token.col}.  Expected failure at: ${loc.line}, ${loc.col}`);
            }
        }
    }

    it('Should have the test infrastructure in place', () => {
        expect(true).toBe(true, "We are testing??");
    });

    describe("testing the 'moo' parser", () => {
        function testSimpleTokens(
            testedValue: string,
            expectedType: string,
            expectedValue: string
        ) {

            const tokens = generateParseTree(testedValue);
            const token = tokens[0];

            if (!token) {
                expect(token).not.toBeNull();
                return;
            }
            expect(token.type).toBe(expectedType, `Expected token of type ${expectedType}`);
            expect(token.value).toBe(expectedValue, `Expected token value to be ${expectedValue}`);
        }

        describe("Testing that strings parse properly", () => {
            it(`it should handle "Normal Strings"`, () => {
                const testedValue = `"Normal String"`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it(`it should handle strings with embedded quotes`, () => {
                const testedValue = `"Normal \\"String\\""`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it(`it should handle strings ith simple escape sequences`, () => {
                const testedValue = `"Backslash \\\\ tab \\t newline\\n cr \\r"`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it(`it should handle unicode escape sequences`, () => {
                const testedValue = `"Omega \\u03a9"`;
                testSimpleTokens(testedValue, "string", testedValue);
            });
            it(`it should not be too greedy about strings`, () => {
                testSimpleTokens(`"Hello" "World"`, "string", `"Hello"`);
                testSimpleTokens(`"Hello""World"`, "string", `"Hello"`);
                testSimpleTokens(`"Hello"1`, "string", `"Hello"`);
            });
        });

        describe("Test that it parses numbers correctly", () => {
            //* These numbers have been tested in OpenSCAD
            //   and all parsed in their compilier.

            it(`should handle normal integers`, () => {
                const testedValue = `123`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it(`should handle a leading decimal point`, () => {
                const testedValue = `.123`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it(`should handle a trailing decimal point`, () => {
                const testedValue = `123.`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it(`should handle a mid decimal point`, () => {
                const testedValue = `1.23`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it(`should split a number at the first decimal point`, () => {
                testSimpleTokens("1.2.3", "number", "1.2");
            });
            it(`should handle the number 0`, () => {
                const testedValue = `0`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("should handle scientific notation: 3.2e23", () => {
                const testedValue = `3.2e23`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("should handle scientific notation: 4.70e+9", () => {
                const testedValue = `4.70e+9`;
                testSimpleTokens(testedValue, "number", testedValue);
            });
            it("should handle scientific notation: 2E-4", () => {
                const testedValue = `2E-4`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("should handle scientific notation: 37.e88", () => {
                const testedValue = `37.e88`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("should handle leading 0's: 0003", () => {
                const testedValue = `0003`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it("should handle trailing 0's: 3.0000", () => {
                const testedValue = `3.0000`;
                testSimpleTokens(testedValue, "number", testedValue);
            });

            it(`should parse 12a as <12> <a>`, () => {
                const tokens = generateParseTree("12a");
                expect(tokens[0].value).toBe("12");
                expect(tokens[1].value).toBe("a");
            });

        });

        describe("Testing that operators parse correctly", () => {
            it("should not split the operators up oddly", () => {
                const ops = rules.OPENSCAD_RULES.operator as string[];
                const joiner = 'qq';

                ops.forEach((op) => {
                    const src = `1 ${op} 7`;

                    const tokens = generateParseTree(src);
                    const importantTokens = tokens.filter(p => p.type !== "WS");
                    const compact = importantTokens.join(joiner);

                    expect(compact).toBe(`1${joiner}${op}${joiner}7`);
                });
            });
        });

        describe("Testing that parsing works correctly", () => {
            it("Verifying that good identifiers parse", () => {
                const identifiers = ["a", "bb", "abc", "_abc", "$abc", "$abc123", "ABc", "abC", "Ab_3c"];

                identifiers.forEach((identifier) => {
                    const tokens = generateParseTree(identifier);
                    expect(tokens[0].value).toBe(identifier);
                });
            });

            it("should error on an incomplete special identifier", () => {
                catchParseError("$", { line: 1, col: 1 });
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

        function catchAstError(source: string, loc: any) {
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
            catchAstError("1=1;", { line: 1, col: 2 });
        });

        it('should fail assigning to a string constant', () => {
            catchAstError(`"a"="b";`, { line: 1, col: 4 });
        });

        it('should fail assigning to a built-in constant', () => {
            catchAstError(`undef=undef;`, { line: 1, col: 6 });
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