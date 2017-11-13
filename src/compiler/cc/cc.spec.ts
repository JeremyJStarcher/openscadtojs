import { Logger } from '../logger/logger';
import { Context } from './context/context';
import { RunTime } from "../cc/run-time";
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

    const statement0 = content[0]; // as ScadTokens.Operator;
    const statement1 = content[1]; // as ScadTokens.Operator;

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
    validate: (runtime: RunTime, expectedValue: any, code: string) => void
  ) {



    const global: any = Function('return this')() || (42, eval)('this');
    global.HACK_CODE = code;

    new Promise((resolve, reject) => {
      const logger = new Logger();
      const context = new Context(null, logger);

      const runtime = new RunTime();
      runtime.context = context;
      runtime.logger = logger;
      runtime.source = code;


      cc.compile(`${code}`).then(ast => {
        const content = getAllTokens(ast);
        return Array.from(cc.runAst(runtime, content));
      }).catch(err => {
        fail(err.message + ": " + code);
      }).then(() => {
        validate(runtime, expectedValue, code);
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

      const validate = (runtime: RunTime, expectedValue: any, code: string) => {
        const value = runtime.context.getIdentifier('var1').value;

        const [, expression] = code.split('=');
        const jsValue = (1, eval)(expression);

        const digitsToRound = (expectedValue + ".").split(".")[1].length;
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
      const tests: [[string, undefined | boolean]] = [
        ["var1=undef;", undefined],
        ["var1=true;", true],
        ["var1=false;", false]
      ];

      const validate = (runtime: RunTime, expectedValue: any, code: string) => {
        const valueToken = runtime.context.getIdentifier('var1');
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
      const tests: [[string, undefined | boolean]] = [
        ["undef1=true;", undefined],
        ["true1=true;", true],
        ["false1=true;", false],
        ["false1=true;", false],
        ["aundef1=true;", undefined],
        ["atrue1=true;", true],
        ["afalse1=true;", false],
        ["aundef=true;", undefined],
        ["atrue=true;", true],
        ["afalse=true;", false]
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
        ["var1=1;var2=2;result=var1+var2;", 3],
      ];

      const validate = (runtime: RunTime, expectedValue: any, code: string) => {
        const valueToken = runtime.context.getIdentifier('result');
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

  xit('should evaluate a compound_statement', () => {

    // Compound statements, by themselves, do not create a new scope.
    // only when used with an 'if' or something like that.

    return new Promise((resolve, reject) => {
      const tests: [[string, any]] = [
        // ["{ }", 3],
        ["{ var1=1;var2=2;result=var1+var2;vark=forcedErrorMessage; }", 3],
      ];

      const validate = (runtime: RunTime, expectedValue: any, code: string) => {
        expect(runtime.logger.getWarnings()[0]).toContain('forcedErrorMessage');
        // const valueToken = runtime.context.getIdentifier('result');
        // expect(valueToken.value).toEqual(expectedValue, `${code} did not equal ${expectedValue}`);
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
