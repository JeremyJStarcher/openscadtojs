import { Logger } from "./logger";

fdescribe('Running compiler/logger tests', () => {
    it('Should have the test infrastructure in place', () => {
        expect(true).toBe(true, 'We are testing??');
    });

    it('Should have cc.compile as a function', () => {
        expect(typeof Logger).toBe('function');
    });

    it('Should log two errors', () => {
        const logger = new Logger();
        const msg1 = "String 1";
        const msg2 = "String 2";
        logger.error(msg1);
        logger.error(msg2);

        const errs = logger.getErrors();
        const infos = logger.getInfos();
        const warnings = logger.getWarnings();

        expect(errs.length).toBe(2);
        expect(infos.length).toBe(0);
        expect(warnings.length).toBe(0);

        expect(errs[0]).toBe(msg1);
        expect(errs[1]).toBe(msg2);
    });

    it('Should log two infos', () => {
        const logger = new Logger();
        const msg1 = "String 1";
        const msg2 = "String 2";
        logger.info(msg1);
        logger.info(msg2);

        const errs = logger.getErrors();
        const infos = logger.getInfos();
        const warnings = logger.getWarnings();

        expect(errs.length).toBe(0);
        expect(infos.length).toBe(2);
        expect(warnings.length).toBe(0);

        expect(infos[0]).toBe(msg1);
        expect(infos[1]).toBe(msg2);
    });

    it('Should log two warnings', () => {
        const logger = new Logger();
        const msg1 = "String 1";
        const msg2 = "String 2";
        logger.warning(msg1);
        logger.warning(msg2);

        const errs = logger.getErrors();
        const infos = logger.getInfos();
        const warnings = logger.getWarnings();

        expect(errs.length).toBe(0);
        expect(infos.length).toBe(0);
        expect(warnings.length).toBe(2);

        expect(warnings[0]).toBe(msg1);
        expect(warnings[1]).toBe(msg2);
    });


});

