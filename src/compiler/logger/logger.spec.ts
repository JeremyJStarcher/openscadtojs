import { Logger } from './logger';

describe('Running compiler/logger tests', () => {
    it('Should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('Should have cc.compile as a function', () => {
        expect(typeof Logger).toBe('function');
    });

    it('Should log two errors', () => {
        const logger = new Logger();
        const msg1 = 'Log Two Errors String 1';
        const msg2 = 'Log Two Errors String 2';
        logger.error(msg1);
        logger.error(msg2);

        const errs = logger.getErrors();
        const infos = logger.getLogs();

        expect(errs.length).toBe(2);
        expect(infos.length).toBe(0);

        expect(errs[0]).toContain(msg1);
        expect(errs[1]).toContain(msg2);
    });

    it('Should log two logs', () => {
        const logger = new Logger();
        const msg1 = 'Log Two Logs String 1';
        const msg2 = 'Log Two Logs String 2';
        logger.echo(msg1);
        logger.echo(msg2);

        const errs = logger.getErrors();
        const logs = logger.getLogs();

        expect(errs.length).toBe(0);
        expect(logs.length).toBe(2);

        expect(logs[0]).toContain(msg1);
        expect(logs[1]).toContain(msg2);
    });

    it('Should log two warnings', () => {
        const logger = new Logger();
        const msg1 = 'Log Two Warnings String 1';
        const msg2 = 'Log Two Warnings String 2';
        logger.warn(msg1);
        logger.warn(msg2);

        const errs = logger.getErrors();
        const logs = logger.getLogs();

        expect(errs.length).toBe(0);
        expect(logs.length).toBe(2);

        expect(logs[0]).toContain(msg1);
        expect(logs[1]).toContain(msg2);
    });
});
