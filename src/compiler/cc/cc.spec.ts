import { RunTime } from '../cc/run-time';
import * as TokenType from '../runtime/token-type';
import * as cc from './cc';
import * as scadTests from '../../../scad_tests/output/scad';
import { ModuleDefinition } from '../runtime/token-type';

describe('Running compiler tests', () => {
    it('should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('should have cc.compile as a function', () => {
        expect(typeof cc.compile).toBe('function');
    });

    it('should generated an error on unexpected end of file', (done) => {
        cc.compile('line1=1').then(() => {
            expect(false).toBe(true, 'There was no compile error');
        }).catch(err => {
            expect(err.message).toBe('Unexpected end of input');
        }).then(() => {
            done();
        });
    });

    it('should generated an error on syntax error', (done) => {
        cc.compile('1=2;').then(() => {
            expect(false).toBe(true, `There was no compile error`);
        }).catch(err => {
            expect(err.message).toContain(`invalid syntax at line 1 col 1`);
        }).then(() => {
            done();
        });
    });

    function getAllTokens(ast: moo.Token | moo.Token[]): TokenType.Token[] {
        if (!Array.isArray(ast)) {
            return getAllTokens([ast]);
        }

        const tokenStream = cc.tokenProvider(ast);
        const content: any = Array.from(tokenStream);

        if (!Array.isArray(content)) {
            return (<any>[content]);
        }
        return content;
    }

    it('should compile a simple program', async () => {

        const ast = await cc.compile('line1=1;line2=2+1;');

        const content = getAllTokens(ast);

        const statement0 = content[0];
        const statement1 = content[1];

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

            expect(content[0].type).toBe('operator');
            expect(lhand0content).toBe('line1');
            expect(rhand0content).toBe('1');

            expect(content[1].type).toBe('operator');
            expect(lhand1content).toBe('line2');
            expect(rhand1content).toBe('+');
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
                expect(err.token.value).toBe('1');
                expect(err.token.col).toBe(1);
            }

            done();
        })();
    });

    it('should error on bad grammar (invalid expression)', (done) => {
        (async () => {
            try {
                const ast = await cc.compile(`var2+'Hello';`);
                getAllTokens(ast);
                expect(false).toBe(true, `End of input error did not happen`);
            } catch (err) {
                expect(err.token.value).toBe('+');
                expect(err.token.col).toBe(5);
            }

            done();
        })();
    });

    function runGeometry(runtime: RunTime) {
        for (let i = 0; i < runtime.geometryList.length; i++) {
            const geometryStatement = runtime.geometryList[i];
            runtime.currentContext = geometryStatement.context;
            const values = geometryStatement.arguments.map(token => token.valueOf(runtime));
            geometryStatement.function.call(null, runtime, ...values);
        }
    }

    function compileAndRun(
        code: string,
        expectedValue: any,
        validate: (runtime: RunTime, expectedValue: any, code: string) => void
    ) {
        const global: any = Function('return this')() || (42, eval)('this');
        global.HACK_CODE = code;

        new Promise((resolve, reject) => {
            const runtime = new RunTime(code);

            cc.compile(`${code}`).then(ast => {
                const content = getAllTokens(ast);
                const res = Array.from(cc.astRunner(runtime, content));
                return res;
            }).catch(err => {
                console.log(code);
                console.error(err);
                fail(err.message + ' : ' + JSON.stringify(code));
                reject(err);
            }).then(() => {
                return runGeometry(runtime);
            }).then(() => {
                validate(runtime, expectedValue, code);
            }).catch(err => {
                console.log(code);
                console.error(err);

                fail(err.message);
                reject(err);
            }).then(() => {
                resolve();
            });
        });
    }

    it('should evaluate a series of expressions', () => {
        return new Promise((resolve, reject) => {
            // Handle numbers as strings so we can do our own rounding and compare.
            const tests: [string, string][] = [
                ['var1=-1;', '-1'],
                ['var1=1+2+3+4;', '10'],
                ['var1=1*2*3*4;', '24'],
                ['var1=1-2-3-4;', '-8'],
                ['var1=1/2/3/4;', '0.0416667'],
                ['var1=1*2+3*4;', '14'],
                ['var1=1+2*3+4;', '11'],
                ['var1=(1+2)*(3+4);', '21'],
                ['var1=1+(2*3)*(4+5);', '55'],
                ['var1=1+(2*3)/4+5;', '7.5'],
                ['var1=5/(4+3)/2;', '0.357143'],
                ['var1=1 + 2.5;', '3.5'],
                ['var1=125;', '125'],
                ['var1=-1+(-2);', '-3'],
                ['var1=-1+(-2.0);', '-3'],
                ['var1=- 1;', '-1'],
                ['var1=- 1 +( -2);', '-3'],
                ['var1=- 1 +(0- -2);', '1'],
                ['var1=-1+(-2.0);', '-3'],
                ['var1=- 1 +(50- -2);', '51']
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                const value = runtime.getIdentifier('var1').valueOf(runtime).value;

                const [, expression] = code.split('=');
                const jsValue = (1, eval)(expression);

                const digitsToRound = (expectedValue + '.').split('.')[1].length;
                const roundedValue = value.toFixed(digitsToRound);
                const roundedJSValue = jsValue.toFixed(digitsToRound);

                expect(roundedValue).toBe(expectedValue, `${code} did not equal ${expectedValue}`);
                expect(roundedJSValue).toBe(expectedValue, `JS TEST: ${code} did not equal ${expectedValue}`);
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    it('should evaluate built-in constants', () => {
        return new Promise((resolve, reject) => {
            const tests: [string, undefined | boolean][] = [
                ['var1=undef;', undefined],
                ['var1=true;', true],
                ['var1=false;', false]
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                const valueToken = runtime.getIdentifier('var1');
                expect(valueToken.value).toEqual(expectedValue, `${code} did not equal ${expectedValue}`);
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    it('should allow variable names that contain keywords, etc.', () => {
        return new Promise((resolve, reject) => {
            const tests: [string, undefined | boolean][] = [
                ['undef1=true;', undefined],
                ['true1=true;', true],
                ['false1=true;', false],
                ['false1=true;', false],
                ['aundef1=true;', undefined],
                ['atrue1=true;', true],
                ['afalse1=true;', false],
                ['aundef=true;', undefined],
                ['atrue=true;', true],
                ['afalse=true;', false]
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                // If we get this far, we are valid.
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    it('should evaluate expressions with variables', () => {
        return new Promise((resolve, reject) => {
            const tests: [[string, any]] = [
                ['var1=1;var2=2;result=var1+var2;', 3],
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                const token = runtime.getIdentifier('result');
                const valueToken = token.valueOf(runtime);
                expect(valueToken.value).toEqual(expectedValue, `${code} did not equal ${expectedValue}`);
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    it('should evaluate a compound_statement', () => {
        // Compound statements, by themselves, do not create a new scope.
        // only when used with an 'if' or something like that.

        return new Promise((resolve, reject) => {
            const tests: [[string, any]] = [
                // ['{ }', 3],
                ['{ varcp1=1;varcp2=2;resultcp=varcp1+varcp2;cperror=forcedErrorMessage; }', 3],
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                expect(runtime.logger.getLogs()[0]).toContain('forcedErrorMessage');
                const valueToken = runtime.getIdentifier('cperror');
                expect(valueToken.value).toBeUndefined(`${code} did not equal ${expectedValue}`);
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    it(`should add 'echo' to the geometry commands`, () => {
        return new Promise((resolve, reject) => {
            const tests: [[string, any]] = [
                ['echo(true);echo(1+99, 400/2, 1000/2*4);var1=999;echo(var1);', 3],
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                const echoLog = runtime.logger.getLogs();
                expect(echoLog[0]).toContain('true');
                expect(echoLog[1]).toContain('100');
                expect(echoLog[1]).toContain('200');
                expect(echoLog[1]).toContain('2000');
                expect(echoLog[2]).toContain('999');

                expect(runtime.geometryList.length).toBe(3);
                expect(runtime.geometryList[0].function).toBeDefined();
                expect(runtime.geometryList[1].function).toBeDefined();
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    it(`should 'echo' empty parens`, () => {
        return new Promise((resolve, reject) => {
            const tests: [string, any][] = [
                [`echo();`, 3],
                [`echo( );`, 3],
                [`echo(\r );`, 3],
                [`echo(\n );`, 3],
                [`echo(    \r  \n     );`, 3],
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                const echoLog = runtime.logger.getLogs();
                expect(echoLog[0]).toBe('ECHO: ');
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });


    it(`should 'echo' string constants with spaces.`, () => {
        return new Promise((resolve, reject) => {
            const tests: [string, any][] = [
                [`echo("Echo Moon");`, 3],
                [`a1=1;echo("Echo Moon");`, 3],
                [`a1="Echo Moon";echo(a1);`, 3],
            ];

            const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                const echoLog = runtime.logger.getLogs();
                expect(echoLog[0]).toContain('Echo Moon');
            };

            const p1 = tests.map(test => {
                return compileAndRun(test[0], test[1], validate);
            });

            Promise.all(p1).then(() => {
                resolve();
            });
        });
    });

    describe('testing comments', () => {
        it('handle single-line comments', () => {

            return new Promise((resolve, reject) => {
                const tests: [string, number][] = [
                    ['// This is a test\nt2=1;', 1],
                    ['v=1;//this is a test\nt2=100;', 100]
                ];

                const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                    const t2 = runtime.getIdentifier('t2');
                    expect(t2.value).toEqual(expectedValue, `${code} did not equal ${expectedValue[0]}`);
                };

                const p1 = tests.map(test => {
                    return compileAndRun(test[0], test[1], validate);
                });

                Promise.all(p1).then(() => {
                    resolve();
                });
            });

        });

        it('handle block comments', () => {

            return new Promise((resolve, reject) => {
                const tests: [string, number][] = [
                    ['/*two comments */ /* this is a test */\nt2=1;', 1],
                    ['/* this is a test */\nt2=1;', 1],
                    ['v=1;\n/* this\nis a  \n\r test */\nt2=100;', 100],
                    ['v=1;/* this is a test */\nt2=100;', 100]
                ];

                const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                    const t2 = runtime.getIdentifier('t2');

                    expect(t2.value).toEqual(expectedValue, `${code} did not equal ${expectedValue[0]}`);
                };

                const p1 = tests.map(test => {
                    return compileAndRun(test[0], test[1], validate);
                });

                Promise.all(p1).then(() => {
                    resolve();
                });
            });

        });

    });

    describe('testing hoisting', () => {
        it('should hoist var declarations, keeping only the latest', () => {

            return new Promise((resolve, reject) => {
                const tests: [[string, number[]]] = [
                    ['t1=100;t2=t1;t2=2*t1;t1=200;', [200, 400]],
                ];

                const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                    const t1 = runtime.getIdentifier('t1');
                    const t2 = runtime.getIdentifier('t2');

                    expect(runtime.logger.getLogs().length).toBe(0);
                    expect(t1.value).toEqual(expectedValue[0], `${code} did not equal ${expectedValue[0]}`);
                    expect(t2.value).toEqual(expectedValue[1], `${code} did not equal ${expectedValue[1]}`);
                };

                const p1 = tests.map(test => {
                    return compileAndRun(test[0], test[1], validate);
                });

                Promise.all(p1).then(() => {
                    resolve();
                });
            });

        });

        it('should hoist module declarations, keeping only the latest', () => {

            return new Promise((resolve, reject) => {
                const tests: [string][] = [
                    ['module m1(false) {};module m1(true) {};'],
                    ['module m1(false) {}module m1(true) {};'],
                    ['module m1(false) {} module m1(true) {};'],
                    ['module m1(false) {}\nmodule m1(true) {};'],
                    ['module m1(false) {}\nmodule m1(true) {}'],
                ];

                const validate = (runtime: RunTime, expectedValue: any, code: string) => {
                    const m1 = runtime.getModule('m1') as ModuleDefinition;

                    expect(runtime.logger.getLogs().length).toBe(0);
                    expect(m1.name).toEqual(`m1`, `Module name error`);
                    expect(m1.arguments.length).toEqual(1, `Module arguments length error`);
                    expect(m1.arguments[0]).toBeTruthy(`Found wrong module definition`);
                };

                const p1 = tests.map(test => {
                    const noResult = null;
                    return compileAndRun(test[0], noResult, validate);
                });

                Promise.all(p1).then(() => {
                    resolve();
                });
            });

        });

    });

    describe(`Running OpenSCAD code and results`, () => {

        scadTests.scadTest.forEach(test => {
            it(`Should pass: ${test.fname}`, () => {

                return new Promise((resolve, reject) => {
                    const tests: [[string, undefined]] = [
                        [test.source, undefined],
                    ];

                    const validate = (runtime: RunTime, expectedValue: any, code: string) => {

                        const logs = runtime.logger.getLogs().filter(l => l);
                        const incomingLogs = test.warnings.filter(l => l);

                        expect(logs.length).toEqual(incomingLogs.length, 'Difference in number of logged messages');

                        logs.forEach((line, i) => {
                            const incoming = incomingLogs[i];
                            expect(line).toEqual(incoming);
                        });
                    };

                    const p1 = tests.map(test => {
                        return compileAndRun(test[0], test[1], validate);
                    });

                    Promise.all(p1).then(() => {
                        resolve();
                    });
                });
            });
        });
    });
});
