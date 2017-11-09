
// import { Logger } from '../logger/logger';
// import { Context } from './context/context';

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

    it('should run compile a simple program', async () => {
        const ast = await cc.compile('line1=1;');
        expect(ast.length).toBe(1);
        expect(ast[0].type).toBe("operators");
    });

});

