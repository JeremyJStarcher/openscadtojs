import * as rules from './tokenizer';
import * as moo from 'moo';
import * as grammar from '../nearley/grammar';
import * as nearley from 'nearley';
// import * as TokenType from '../runtime/token-type';

// declare function require(path: string): any;
// declare function since(text:string):void;

export function toCode(subtree: any): string {
    if (Array.isArray(subtree)) {
        const str = subtree.map(b => {
            return toCode(b);
        });
        return str.join(' ');
    } else {
        if (subtree.type === 'number' || subtree.type === 'identifier') {
            return subtree.value;
        }

        if (subtree.type === 'operator') {
            const op = subtree.func;
            const v1 = toCode(subtree.lhand);
            const v2 = toCode(subtree.rhand);

            return `${op} (${v1}, ${v2})`;
        }
        if (subtree.type === 'eos') {
            return subtree.value;
        }
    }
    return '???' + JSON.stringify(subtree) + Array.isArray(subtree);
}

describe('Tokenizer Tests', () => {

    function generateParseTree(source: string): moo.Token[] {
        (<any>rules.OPENSCAD_RULES).myError = { match: /[\$?`]/, error: true };

        const lexer = moo.compile(rules.OPENSCAD_RULES);
        lexer.reset(source);
        const tokens: moo.Token[] = Array.from(<any>lexer);

        if ((<any>tokens[0]).type === 'myError') {
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
        expect(true).toBe(true, 'We are testing??');
    });

    describe(`testing the 'moo' parser`, () => {
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

        describe('Testing that strings parse properly', () => {
            it(`it should handle 'Normal Strings'`, () => {
                const testedValue = `"Normal String"`;
                testSimpleTokens(testedValue, 'string', testedValue);
            });
            it(`it should handle strings with embedded quotes`, () => {
                const testedValue = `"Normal \\"String\\""`;
                testSimpleTokens(testedValue, 'string', testedValue);
            });
            it(`it should handle strings ith simple escape sequences`, () => {
                const testedValue = `"Backslash \\\\ tab \\t newline\\n cr \\r"`;
                testSimpleTokens(testedValue, 'string', testedValue);
            });
            it(`it should handle unicode escape sequences`, () => {
                const testedValue = `"Omega \\u03a9"`;
                testSimpleTokens(testedValue, 'string', testedValue);
            });
            it(`it should not be too greedy about strings`, () => {
                testSimpleTokens(`"Hello" "World"`, 'string', `"Hello"`);
                testSimpleTokens(`"Hello""World"`, 'string', `"Hello"`);
                testSimpleTokens(`"Hello"1`, 'string', `"Hello"`);
            });
        });

        describe('Test that it parses numbers correctly', () => {
            // These numbers have been tested in OpenSCAD
            // and all parsed in their compilier.

            it(`should handle normal integers`, () => {
                const testedValue = `123`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });
            it(`should handle a leading decimal point`, () => {
                const testedValue = `.123`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });
            it(`should handle a trailing decimal point`, () => {
                const testedValue = `123.`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });
            it(`should handle a mid decimal point`, () => {
                const testedValue = `1.23`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });
            it(`should split a number at the first decimal point`, () => {
                testSimpleTokens('1.2.3', 'number', '1.2');
            });
            it(`should handle the number 0`, () => {
                const testedValue = `0`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });

            it('should handle scientific notation: 3.2e23', () => {
                const testedValue = `3.2e23`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });

            it('should handle scientific notation: 4.70e+9', () => {
                const testedValue = `4.70e+9`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });
            it('should handle scientific notation: 2E-4', () => {
                const testedValue = `2E-4`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });

            it('should handle scientific notation: 37.e88', () => {
                const testedValue = `37.e88`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });

            it(`should handle leading 0's: 0003`, () => {
                const testedValue = `0003`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });

            it(`should handle trailing 0's: 3.0000`, () => {
                const testedValue = `3.0000`;
                testSimpleTokens(testedValue, 'number', testedValue);
            });

            it(`should parse 12a as <12> <a>`, () => {
                const tokens = generateParseTree('12a');
                expect(tokens[0].value).toBe('12');
                expect(tokens[1].value).toBe('a');
            });

        });

        describe('Testing that parsing works correctly', () => {
            it('Verifying that good identifiers parse', () => {
                const identifiers = ['a', 'bb', 'abc', '_abc', '$abc', '$abc123', 'ABc', 'abC', 'Ab_3c'];

                identifiers.forEach((identifier) => {
                    const tokens = generateParseTree(identifier);
                    expect(tokens[0].value).toBe(identifier);
                });
            });

            it('should error on an incomplete special identifier', () => {
                catchParseError('$', { line: 1, col: 1 });
            });
        });
    });

    describe('Testing nearly', () => {
        function generateAst(code: string) {
            return new Promise<[moo.Token[]]>((resolve, reject) => {

                const global: any = Function('return this')() || (42, eval)('this');
                global.HACK_CODE = code;

                // Make sure dangling comments don't cause death.
                code += '\n';

                // let lexer = moo.compile(<any>rules.OPENSCAD_RULES);
                // lexer.reset(code);
                // let t = lexer.next();
                // while (t) {
                //     debugger;
                //     t = lexer.next();
                // }

                const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
                parser.feed(code);
                const res = parser.results as [moo.Token[]];

                // console.log('===================================================');
                // console.log(code);
                // console.log(JSON.stringify(res));

                // If the length == 0, there was no valid tree built.
                // if the length > 1, there is ambiguous grammar that can be parsed
                //   multiple ways.  Either condition is bad.

                if (res.length !== 1) {
                    debugger;
                    fail(`AST length (${res.length}) should === 1 for ${code}`);
                }

                setTimeout(() => {
                    resolve(res);
                });
            });
        }

        function catchAstError(source: string, loc: any) {
            return generateAst(source).then(ast => {
                fail(`[${source}] parsed correctly. It shouldn't have.`);
            }).catch(err => {
                const token: any = err.token;
                if (token.line !== loc.line || token.col !== loc.col) {
                    fail(`[${source}] failed at ${token.line}, ${token.col}.  Expected failure at: ${loc.line}, ${loc.col}`);
                }
            });
        }

        it('Ensuring module loaded', () => {
            expect(nearley).not.toBeNull();
            expect(grammar).not.toBeNull();
        });

        describe('parse simple assignments', () => {
            it('parse simple assignments1', () => {
                return generateAst('line1=1;');
            });
            it('parse simple assignments2', () => {
                return generateAst('line2=2-1 ; ');
            });
            it('parse simple assignments3', () => {
                return generateAst('line3=bbba + 3; ');
            });
            it('parse simple assignments4', () => {
                return generateAst(`line4 = "Hellow' +'World"  ;`);
            });
            it('parse simple assignments5', () => {
                return generateAst(`line5 = "9" + "a" ;`);
            });
        });

        describe(`syntax error tests`, () => {
            it('should fail assigning to a numeric constant', () => {
                return catchAstError('1=1;', { line: 1, col: 2 });
            });

            it('should fail assigning to a string constant', () => {
                return catchAstError(`"a"="b";`, { line: 1, col: 4 });
            });

            it('should fail assigning to a built-in constant', () => {
                return catchAstError(`undef=undef;`, { line: 1, col: 6 });
            });
        });

        describe(`parse complex assignments`, () => {
            it('parse complex assignments1', () => {
                return generateAst('line1 = (1 * 2);');
            });
            it('parse complex assignments2', () => {
                return generateAst('line1 = 1;');
            });
            it('parse complex assignments3', () => {
                return generateAst('line1 = 1 + 2 * 3;');
            });
            it('parse complex assignments4', () => {
                return generateAst('line2 = (1+3) * 4 * 5 / (2-1);');
            });
        });

        describe(`parse multiple statements`, () => {
            it('parse multiple statements1', () => {
                return generateAst('line1=1;    ');
            });
            it('parse multiple statements2', () => {
                return generateAst('    line1=1;    ');
            });
            it('parse multiple statements3', () => {
                return generateAst('line1=1;line2=2;line3=3;');
            });
            it('parse multiple statements4', () => {
                return generateAst('line1 = 1;  line2 = 2;line3 =3;');
            });
            it('parse multiple statements5', () => {
                return generateAst('  line1 = 1;  line2 = 2;line3 =3;');
            });
            it('parse multiple statements6', () => {
                return generateAst('  line1 = 1;  line2 = 2;line3 =3;   ');
            });
        });

        describe(`it should parse unary operators`, () => {
            it('should parse unary !', () => {
                return generateAst('line1=!1;    ');
            });

            it('should parse unary +', () => {
                return generateAst('line1=+1;    ');
            });

            it('should parse unary -', () => {
                return generateAst('line1=-1;    ');
            });
        });

        describe(`should parse vectors`, () => {
            it('should parse vectors', () => {
                return generateAst(`line1=[1, 2, true, "A"];`);
            });
            it('should parse vectors', () => {
                return generateAst(`line1=[[1, 2], [true], "A"];`);
            });
        });

        describe(`should parse ranges`, () => {
            it('should parse ranges', () => {
                return generateAst(`line1=[102:1002];`);
            });
            it('should parse ranges', () => {
                return generateAst(`line1=[1003:30:1030];`);
            });
        });

        describe(`should parse a compound statement`, () => {
            it('should parse a compound statement', () => {
                return generateAst('{}');
            });
            it('should parse a compound statement', () => {
                return generateAst('{var1=1;}');
            });
            it('should parse a compound statement', () => {
                return generateAst('{var2=2;var22=22;}');
            });
        });

        describe(`should parse function declarations`, () => {
            it('should parse function declarations', () => {
                return generateAst('function func0() = 5;');
            });
            it('should parse function declarations', () => {
                return generateAst('function func1(x=3) = 2*x+1;');
            });
            it('should parse function declarations', () => {
                return generateAst('function func2(x,y) = 2*x+y;');
            });
        });

        describe(`should parse vector comparisons`, () => {
            it('should parse vector comparisons', () => {
                return generateAst('echo([1] == [1]);');
            });
        });

        describe(`should parse white space`, () => {
            it('should parse white space', () => {
                return generateAst(' echo([1] == [1]);');
            });
            it('should parse white space', () => {
                return generateAst('\techo([1] == [1]);');
            });
            it('should parse white space', () => {
                return generateAst('\recho([1] == [1]);');
            });
        });

        describe(`Comments`, () => {
            it('should parse singe-line comments', () => {
                return generateAst('// this is a comment\nsingleLineComment1=1;');
            });
            it('should parse singe-line comments', () => {
                return generateAst('singleLineComment2;// this is a comment');
            });

            it('should parse empty comment block', () => {
                return generateAst('/**/emptyCommentBlock=true;');
            });

            it('should parse multi-line comment on one line', () => {
                return generateAst('t1=100;/* A comment */');
            });

            it('should parse multi-line comment on two lines', () => {
                return generateAst('/* A \ncomment */t1=200;');
            });

            it('should parse multi-line comment with single-quote marks', () => {
                return generateAst(`/* a quote ' */t1=200;`);
            });

            it('should parse multi-line comment with double-quote marks', () => {
                return generateAst(`/* a double-quote ' */t1=200;`);
            });

            it('should parse nested multi-line comments', () => {
                return generateAst(`/* /* a nested comment */t1=200;`);
            });

            it('should parse nested multi-line comments', () => {
                return generateAst(`/* /* /* a double-nested comment */t1=200;`);
            });
        });

        describe(`if statements`, () => {
            it('should parse if statements1', () => {
                return generateAst(`if(true) t1=200;t2=500;`);
            });

            it('should parse if statements2', () => {
                return generateAst(`if(true) t1=200;`);
            });

            it('should parse if statements3', () => {
                return generateAst(`if(true)t1=200;`);
            });

            it('should parse if statements4', () => {
                return generateAst(`if(true){t1=200;}`);
            });

            it('should parse if statements5', () => {
                return generateAst(`if(true) if(false) {t1=200;}`);
            });
        });

        describe(`if/else statements`, () => {
            it('should parse if/else statements1', () => {
                return generateAst(`if(true){t1=200;} else {t2=500;}`);
            });
            it('should parse if/else statements3', () => {
                return generateAst(`if(true) t1=200; else t2=500;`);
            });
            it('should parse if/else statements4', () => {
                return generateAst(`if(true){t1=200;} else {t2=500;}`);
            });
            it('should parse if/else statements5', () => {
                return generateAst(`if(true) {if(false) {t1=200;} else {echo("hi");}}`);
            });
        });

        describe(`nested if/else`, () => {
            it('should parse nested if/else statements1', () => {
                return generateAst(`if(true) if(false) {echo("innerif");} else {echo("innerelse");}`);
            });

            it('should parse nested if/else statements2', () => {
                return generateAst(`if(true) if(false) echo("innerif"); else echo("innerelse"); else echo("outerelse");`);
            });
        });

        describe(`extra semis`, () => {
            it('should handle stray semis1', () => {
                return generateAst(`a=1;;`);
            });
            it('should handle stray semis2', () => {
                return generateAst(`a=1; ;`);
            });
            it('should handle stray semis3', () => {
                return generateAst(`;a=1; ;`);
            });
        });

        describe(`module statements`, () => {
            it('should parse module statement, no parameters, block statement', () => {
                return generateAst(`module gizmo() {}`);
            });

            it(`should parse module statement space between parens, block statement`, () => {
                return generateAst(`module gizmo(  ) {}`);
            });

            it(`should parse module statement, simple expressions, blockstatement`, () => {
                return generateAst(`module gizmo(1, 2*4, true, myVar) {}`);
            });

            it(`should parse module statement, assignment expression, blockstatement`, () => {
                return generateAst(`module gizmo(1, 2*4, center=true, myVar) {}`);
            });

            it(`should parse module statement, assignment expression, single statement`, () => {
                return generateAst(`module gizmo(1, 2*4, center=true, myVar) echo("Hi Hopes");`);
            });
        });
    });
});