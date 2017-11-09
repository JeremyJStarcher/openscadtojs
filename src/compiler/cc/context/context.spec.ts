import { Context, ContextType } from "./context";
import { Logger } from "../../logger/logger";

fdescribe('Running compiler/context tests', () => {
    it('should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('should have cc.compile as a function', () => {
        expect(typeof Context).toBe('function');
    });

    it('should set and get an integer', () => {
        const context = new Context(null, new Logger());
        const value = 10 as ContextType;
        context.set('a', value);
        const retrievedValue = context.get('a');

        expect(value).toBe(retrievedValue);
    });

    it('should set and get a a string', () => {
        const context = new Context(null, new Logger());
        const value = "Fizzbin" as ContextType;
        context.set('a', value);
        const retrievedValue = context.get('a');

        expect(value).toBe(retrievedValue);
    });

    it('should Child context should cascade to parent', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const value = "Fizzbin" as ContextType;
        parentContext.set('a', value);
        const retrievedValue = childContext.get('a');

        expect(value).toBe(retrievedValue);
    });

    it('should cascade to parent context if child does not contain', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const value = "Fizzbin" as ContextType;
        parentContext.set('a', value);
        const retrievedValue = childContext.get('a');

        expect(value).toBe(retrievedValue);
    });

    it('should not cascade to parent context if child does contain', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const variableName = 'varname';
        const parentValue = 'Dragon Poker' as ContextType;
        const childValue = 'Fizzbin' as ContextType;


        parentContext.set(variableName, parentValue);
        childContext.set(variableName, childValue);
        const retrievedChildValue = childContext.get(variableName);
        const retrievedParentValue = parentContext.get(variableName);

        expect(childValue).toBe(retrievedChildValue);
        expect(retrievedParentValue).toBe(parentValue);
    });

    it('should generate a warning if variable not found', () => {
        const logger = new Logger();
        const parentContext = new Context(null, logger);
        const childContext = new Context(parentContext, logger);

        const variableName = 'longVariableName';
        const retrievedValue = childContext.get(variableName);

        const warnings = logger.getWarnings();
        expect(retrievedValue).not.toBeDefined();
        expect(warnings.length).toBe(1);
        expect(warnings[0]).toContain(variableName);
    });

});

