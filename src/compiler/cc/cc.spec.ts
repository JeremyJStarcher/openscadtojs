
// import { Logger } from '../logger/logger';
// import { Context } from './context/context';
import * as ScadTokens from "../tokenizer/scad-types";
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


    function getAllTokens(ast: moo.Token | moo.Token[]): moo.Token[] {
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

        expect(statement0).toEqual(jasmine.any(ScadTokens.Operator));
        expect(statement1).toEqual(jasmine.any(ScadTokens.Operator));
        expect(content.length).toBe(2);
        
        if (statement0 instanceof ScadTokens.Operator && statement1 instanceof ScadTokens.Operator) {
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

});

