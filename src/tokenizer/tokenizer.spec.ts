declare function require(path: string): any;
const OPENSCAD_RULES = require('./tokenizer');


import * as moo from 'moo'
import * as grammar from "../nearley/grammar";
import * as nearley from 'nearley';

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

        // describe("Testing that operators parse correctly", () => {
        //     it("Verifying that operators are found by the longest first", () => {
        //         const lexer = moo.compile(OPENSCAD_RULES);
        //         const ops = OPENSCAD_RULES.operators as string[];
        //         const joiner = 'qq';

        //         ops.forEach((op) => {
        //             const src = `1 ${op} 7`;
        //             lexer.reset(src);

        //             const tokens: moo.Token[] = Array.from(<any>lexer);
        //             const importantTokens = tokens.filter(p => p.type !== "WS");
        //             const compact = importantTokens.join(joiner);

        //             expect(compact).toBe(`1${joiner}${op}${joiner}7`);
        //         });
        //     });
        // });
        describe("Testing that identifiers parse correctly", () => {
            it("Verifying that identifiers parse", () => {
                const lexer = moo.compile(OPENSCAD_RULES);
                const identifiers = ["a", "bb", "abc", "_abc", "$abc", "$abc123", "ABc", "abC", "Ab_3c"];


                identifiers.forEach((identifier) => {
                    lexer.reset(identifier);

                    const tokens: moo.Token[] = Array.from(<any>lexer);
                    expect(tokens[0].value).toBe(identifier);
                });

            });
            it("Verifying that bad identifers errror", () => {
                const lexer = moo.compile(OPENSCAD_RULES);
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
        it('Ensuring module loaded', () => {
            expect(nearley).not.toBeNull();
            expect(grammar).not.toBeNull();

        });

        it('parse simple assignments', () => {
            function testTokens(token: string) {
                const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
                parser.feed(token);
                const res = parser.results as [moo.Token[]];

                // console.log("===================================================");
                // console.log(JSON.stringify(res));

                expect(res.length).toBe(1);
            }
            
            testTokens("bbbc=1;");
            testTokens("cccc=2-1 ; ");            
            testTokens("bbba=bbba + 3; ");
            testTokens(`a = "Hellow" +"World"  ;`);
            testTokens(`a = "9"+ "a" ;`);
        });
    });
});