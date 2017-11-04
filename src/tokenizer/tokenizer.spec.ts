import {Tokenizer} from './tokenizer';

debugger;

describe('Tokenizer Tests', () => {
    it('The tests run', () => {
        expect(true).toBe(true);
    });
    
    it('isEOS', () => {
        const emptyString = new Tokenizer('');
        expect(emptyString.isEOS()).toBe(true);

        const numberTokenizer = new Tokenizer('42');
        expect(numberTokenizer.isEOS()).toBe(true);
    });

});