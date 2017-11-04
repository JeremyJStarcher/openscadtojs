import { TokenizerModule } from './tokenizer';
import * as moo from 'moo'

// const Tokenizer = TokenizerModule.Tokenizer;

describe('Tokenizer Tests', () => {
    it('The tests run', () => {
        expect(true).toBe(true);
    });


    describe("moo", () => {
        // it("Basic moo test", () => {
        //     const lexer = moo.compile(TokenizerModule.OPENSCAD_RULES);

        //     lexer.reset('while (10) cows\nmoo')
        //     const token = lexer.next();
        //     if (token) {
        //         expect(token.type).toBe('keyword');
        //     }

        //     lexer.next() // -> { type: 'keyword', value: 'while' }
        //     lexer.next() // -> { type: 'WS', value: ' ' }
        //     lexer.next() // -> { type: 'lparen', value: '(' }
        //     lexer.next() // -> { type: 'number', value: '10' }

        // });

        function testSimpleTokens(
            testedValue: string,
            expectedType: string,
            expectedValue: string
        ) {
            const lexer = moo.compile(TokenizerModule.OPENSCAD_RULES);
            lexer.reset(testedValue);
            const token = lexer.next();

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
            
    });
});