declare function require(path: string): any;
const OPENSCAD_RULES = require('./tokenizer');


import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';
import { flatten } from "../nearly-flat";

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
            const lexer = moo.compile(OPENSCAD_RULES);
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
                const lexer = moo.compile(OPENSCAD_RULES);
                const ops = OPENSCAD_RULES.operators as string[];
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
    });

    describe('Testing nearly', () => {
        it('Ensuring module loaded', () => {
            expect(nearley).not.toBeNull();
            expect(grammar).not.toBeNull();

        });
        it('Expect it to be able to parse numbers', () => {

            function testOneToken(token: string) {
                const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
                parser.feed(token);
                const res = parser.results;
                expect(res[0].length).toBe(1);

            }

            testOneToken("100");
            testOneToken("0.9");
            testOneToken("8.8");
            testOneToken("5.");
        });
        it('Expect it to be able to three-part expressions', () => {
            function testTokens(token: string) {
                const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
                parser.feed(token);
                const res = parser.results as [moo.Token[]];
                const flatResults = flatten(res[0]);

                expect(flatResults.length).toBe(5);
            }

            testTokens("44+3");
            testTokens(`"Hellow"+"World"`);
            testTokens(`"144"+"a"`);
        });

        it('Expect it to be able to three-part expressions with white space', () => {
            function testTokens(token: string) {
                const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
                parser.feed(token);
                const res = parser.results as [moo.Token[]];
                const flatResults = flatten(res[0]);

                expect(flatResults.length).toBe(5);
            }

            testTokens("1 + 3");
            testTokens(`"Hellow" +"World"`);
            testTokens(`"9"+ "a"`);
        });
    });
});