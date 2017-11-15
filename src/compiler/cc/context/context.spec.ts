import { Context } from "./context";
import { Logger } from "../../logger/logger";
import * as TokenType from "../../runtime/token-type";

describe('Running compiler/context tests', () => {
    it('should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('should have cc.compile as a function', () => {
        expect(typeof Context).toBe('function');
    });

    it('should set and get an integer', () => {
        const context = new Context(null, new Logger());
        const savedToken = new TokenType.Number(10);
        context.setIdentifier('a', savedToken);
        const retrievedToken = context.getIdentifier('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should set and get a a string', () => {
        const context = new Context(null, new Logger());
        const savedToken = new TokenType.String("Fizzban");
        context.setIdentifier('a', savedToken);
        const retrievedToken = context.getIdentifier('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should Child context should cascade to parent', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const savedToken = new TokenType.String("Fizzban");
        parentContext.setIdentifier('a', savedToken);
        const retrievedToken = childContext.getIdentifier('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should cascade to parent context if child does not contain', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const savedToken = new TokenType.String("Fizzban");
        parentContext.setIdentifier('a', savedToken);
        const retrievedToken = childContext.getIdentifier('a');

        expect(savedToken.value).toBe(retrievedToken.value);
    });

    it('should create unique ids', () => {
        const logger = new Logger();

        const contextList = [0, 1, 2, 3, 4, 5, 6, 7].map(id => {
            return new Context(null, logger);
        });

        const ids = contextList.map(c => c.getContextId());
        const allAreUnique = new Set(ids).size === ids.length;

        expect(allAreUnique).toBeTruthy();
    });


    it('should not cascade to parent context if child does contain', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const variableName = 'varname';
        const savedParentToken = new TokenType.String("Dragon Poker");
        const savedChildToken = new TokenType.String("Fizzbin");


        parentContext.setIdentifier(variableName, savedParentToken);
        childContext.setIdentifier(variableName, savedChildToken);
        const retrievedChildToken = childContext.getIdentifier(variableName);
        const retrievedParentToken = parentContext.getIdentifier(variableName);

        expect(savedChildToken).toBe(retrievedChildToken);
        expect(retrievedParentToken.value).toBe(savedParentToken.value);
    });

    it('should generate a warning if variable not found', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const variableName = 'longVariableName';
        const retrievedToken = childContext.getIdentifier(variableName);

        const warnings = logger.getWarnings();

        expect(retrievedToken).toEqual(jasmine.any(TokenType.Undefined));
        // expect(retrievedToken.value).not.toBeDefined();
        expect(warnings.length).toBe(1);
        expect(warnings[0]).toContain(variableName);
    });

});

