import * as cc from "./cc";

describe('Running compiler tests', () => {
    it('Should have the test infrastructure in place', () => {
        expect(true).toBe(true, "We are testing??");
    });

    it('Should have cc.compile as a function', () => {
        expect(typeof cc.compile).toBe("function");
    });
});

