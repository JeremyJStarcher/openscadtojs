import { Context } from "./context";
import { Logger } from "../../logger/logger";
import * as ScadTokens from "../../runtime/tokens";

describe('Running compiler/context tests', () => {
    it('should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('should have cc.compile as a function', () => {
        expect(typeof Context).toBe('function');
    });

    it('should set and get an integer', () => {
        const context = new Context(null, new Logger());
        const savedToken = new ScadTokens.NumberConstant(10);
        context.set('a', savedToken);
        const retrievedToken = context.get('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should set and get a a string', () => {
        const context = new Context(null, new Logger());
        const savedToken = new ScadTokens.StringConstant("Fizzban");
        context.set('a', savedToken);
        const retrievedToken = context.get('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should Child context should cascade to parent', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const savedToken = new ScadTokens.StringConstant("Fizzban");
        parentContext.set('a', savedToken);
        const retrievedToken = childContext.get('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should cascade to parent context if child does not contain', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const savedToken = new ScadTokens.StringConstant("Fizzban");
        parentContext.set('a', savedToken);
        const retrievedToken = childContext.get('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should not cascade to parent context if child does contain', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const variableName = 'varname';
        const savedParentToken = new ScadTokens.StringConstant("Dragon Poker");
        const savedChildToken = new ScadTokens.StringConstant("Fizzbin");


        parentContext.set(variableName, savedParentToken);
        childContext.set(variableName, savedChildToken);
        const retrievedChildToken = childContext.get(variableName);
        const retrievedParentToken = parentContext.get(variableName);

        expect(savedChildToken).toBe(retrievedChildToken);
        expect(retrievedParentToken.value).toBe(savedParentToken.value);
    });

    it('should generate a warning if variable not found', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const variableName = 'longVariableName';
        const retrievedToken = childContext.get(variableName);

        const warnings = logger.getWarnings();

        expect(retrievedToken).toEqual(jasmine.any(ScadTokens.UndefinedConstant));
        // expect(retrievedToken.value).not.toBeDefined();
        expect(warnings.length).toBe(1);
        expect(warnings[0]).toContain(variableName);
    });

});

