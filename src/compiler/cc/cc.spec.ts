import { Logger } from '../logger/logger';
import { Context } from './context/context';
import * as TokenType from "../runtime/token-type";
import * as cc from "./cc";

describe('Running compiler tests', () => {
    it('should have the test infrastructure in place', () => {
        expect(true).toBe(true, "We are testing??");
    });

    it('should have cc.compile as a function', () => {
        expect(typeof cc.compile).toBe("function");
    });

    it('should generated an error on unexpected end of file', (done) => {
        cc.compile('line1=1').then(() => {
            expect(false).toBe(true, "There was no compile error");
        }).catch(err => {
            expect(err.message).toBe("Unexpected end of input");
        }).then(() => {
            done();
        });
    });

    it('should generated an error on syntax error', (done) => {
        cc.compile('1=2;').then(() => {
            expect(false).toBe(true, `There was no compile error`);
        }).catch(err => {
            expect(err.message).toContain(`invalid syntax at line 1 col 2`);
        }).then(() => {
            done();
        });
    });


    function getAllTokens(ast: moo.Token | moo.Token[]): TokenType.Token[] {
        if (!Array.isArray(ast)) {
            return getAllTokens([ast]);
        }

        const tokenStream = cc.tokenFeeder(ast);
        const content: any = Array.from(tokenStream);

        if (!Array.isArray(content)) {
            return (<any>[content]);
        }
        return content;
    }

    it('should run compile a simple program', async () => {

        const ast = await cc.compile('line1=1;line2=2+1;');

        const content = getAllTokens(ast);

        const statement0 = content[0];// as ScadTokens.Operator;
        const statement1 = content[1];// as ScadTokens.Operator;

        expect(statement0).toEqual(jasmine.any(TokenType.Operator));
        expect(statement1).toEqual(jasmine.any(TokenType.Operator));
        expect(content.length).toBe(2);

        if (statement0 instanceof TokenType.Operator && statement1 instanceof TokenType.Operator) {
            const lhand0 = statement0.lhand;
            const lhand1 = statement1.lhand;

            const rhand0 = statement0.rhand;
            const rhand1 = statement1.rhand;

            const lhand0content = getAllTokens(lhand0).join();
            const lhand1content = getAllTokens(lhand1).join();

            const rhand0content = getAllTokens(rhand0).join();
            const rhand1content = getAllTokens(rhand1).join();

            expect(content[0].type).toBe("operator");
            expect(lhand0content).toBe("line1");
            expect(rhand0content).toBe("1");

            expect(content[1].type).toBe("operator");
            expect(lhand1content).toBe("line2");
            expect(rhand1content).toBe("+");
        }
    });

    it('should error on unexpected end of input', (done) => {
        (async () => {
            try {
                const ast = await cc.compile('var1=1');
                getAllTokens(ast);
                expect(false).toBe(true, `End of input error did not happen`);
            } catch (err) {
                expect(err.message).toContain('end of input');
            }

            done();
        })();
    });

    it('should error on bad grammar (assignment to a constant)', (done) => {
        (async () => {
            try {
                const ast = await cc.compile('1=1;');
                getAllTokens(ast);
                expect(false).toBe(true, `End of input error did not happen`);
            } catch (err) {
                expect(err.token.value).toBe('=');
                expect(err.token.col).toBe(2);
            }

            done();
        })();
    });

    xit('should error on bad grammar (invalid expression)', (done) => {
        (async () => {
            try {
                const ast = await cc.compile('var2+"Hello";');
                getAllTokens(ast);
                expect(false).toBe(true, `End of input error did not happen`);
            } catch (err) {
                expect(err.token.value).toBe('+');
                expect(err.token.col).toBe(5);
            }

            done();
        })();
    });

    function compileAndRun(
        code: string,
        expectedValue: any,
        validate: (context: Context, expectedValue: any, code: string) => void
    ) {
        new Promise((resolve, reject) => {
            const logger = new Logger();
            const context = new Context(null, logger);

            cc.compile(`${code}`).then(ast => {
                const content = getAllTokens(ast);
                return cc.runAst(content, context);
            }).catch(err => {
                fail(err.message + ": " + code);
            }).then(() => {
                validate(context, expectedValue, code);
            }).catch(err => {
                expect(true).toBe(false, err.message + ": " + code);
                reject(err);
            }).then(() => {
                resolve();
            });
        });
    }

    it('should evaluate a series of expressions', () => {
        return new Promise((resolve, reject) => {
            // Handle numbers as strings so we can do our own rounding and compare.
            const tests: [[string, string]] = [
                ["var1=-1;", "-1"],
                ["var1=1+2+3+4;", "10"],
                ["var1=1*2*3*4;", "24"],
                ["var1=1-2-3-4;", "-8"],
                ["var1=1/2/3/4;", "0.0416667"],
                ["var1=1*2+3*4;", "14"],
                ["var1=1+2*3+4;", "11"],
                ["var1=(1+2)*(3+4);", "21"],
                ["var1=1+(2*3)*(4+5);", "55"],
                ["var1=1+(2*3)/4+5;", "7.5"],
                ["var1=5/(4+3)/2;", "0.357143"],
                ["var1=1 + 2.5;", "3.5"],
                ["var1=125;", "125"],
                ["var1=-1+(-2);", "-3"],
                ["var1=-1+(-2.0);", "-3"],
                ["var1=- 1;", "-1"],
                ["var1=- 1 +( -2);", "-3"],
                ["var1=- 1 +(0- -2);", "1"],
                ["var1=-1+(-2.0);", "-3"],
                ["var1=- 1 +(50- -2);", "51"]
            ];

            const validate = (context: Context, expectedValue: any, code: string) => {
                debugger;
                const value = context.get('var1').value;

                const [, expression] = code.split('=');
                const jsValue = eval(expression);

                const digitsToRound = (expectedValue + ".").split(".")[1].length;
                const roundedValue = value.toFixed(digitsToRound);
                const roundedJSValue = jsValue.toFixed(digitsToRound);

                expect(roundedValue).toBe(expectedValue, `${code} did not equal ${expectedValue}`);
                expect(roundedJSValue).toBe(expectedValue, `JS TEST: ${code} did not equal ${expectedValue}`);
            }

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            })

            Promise.all(p1).then(() => {
                resolve();
            });

        });
    });

    it('should evaluate built-in constants', () => {
        return new Promise((resolve, reject) => {
            const tests: [[string, undefined | boolean]] = [
                ["undef", undefined],
                ["true", true],
                ["false", false]
            ];

            function makeTest(code: string, expectedValue: any) {
                new Promise((resolve, reject) => {
                    const logger = new Logger();
                    const context = new Context(null, logger);

                    cc.compile(`var1=   ${code};`).then(ast => {
                        const content = getAllTokens(ast);
                        return cc.runAst(content, context);
                    }).then(() => {
                        const valueToken = context.get('var1');
                        expect(valueToken.value).toEqual(expectedValue);

                    }).catch(err => {
                        expect(true).toBe(false, err.message);
                        reject(err);
                    }).then(() => {
                        resolve();
                    });
                });
            }

            const p1 = tests.map(test => {
                return makeTest(test[0], test[1]);
            })

            Promise.all(p1).then(() => {
                resolve();
            });

        });


    });

});


