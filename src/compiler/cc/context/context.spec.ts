import { Context, ContextType } from "./context";

fdescribe('Running compiler/context tests', () => {
    it('Should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('Should have cc.compile as a function', () => {
        expect(typeof Context).toBe('function');
    });

    it('Should set and get an integer', () => {
        const context = new Context(null);
        const value = 10 as ContextType;
        context.set('a', value);
        const retrievedValue = context.get('a');

        expect(value).toBe(retrievedValue);
    });

    it('Should set and get a a string', () => {
        const context = new Context(null);
        const value = "Fizzbin" as ContextType;
        context.set('a', value);
        const retrievedValue = context.get('a');

        expect(value).toBe(retrievedValue);
    });

    it('Child context should cascade to parent', () => {
        const parentContext = new Context(null);
        const childContext = new Context(parentContext);


        const value = "Fizzbin" as ContextType;
        parentContext.set('a', value);
        const retrievedValue = childContext.get('a');

        expect(value).toBe(retrievedValue);
    });


});

