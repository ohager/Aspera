import {CryptoService} from "../crypto.service";

describe('CryptoService', () => {

    it('should be created', () => {
        const service = new CryptoService();
        expect(service).not.toBeNull();
    });
/*
    describe('generatePassphrase', () => {
        it('should generate a single nice passphrase (12 tokens)', async () => {
            const service = new CryptoService();
            const passphrase = await service.generatePassPhrase();
            expect(passphrase).not.toBeNull();
            expect(passphrase.length).toBe(12);
            // minimum expected lower bound
            expect(passphrase.join('').length).toBeGreaterThan(12 * 4);
        });

        it('should generate several different passphrases', async () => {
            const service = new CryptoService();

            let passphrases = new Set();
            for(let i=0; i<10; ++i){
                const passphraseTokens = await service.generatePassPhrase();
                const phrase = passphraseTokens.join('');
                expect(passphrases.has(phrase)).toBeFalsy();
                passphrases.add(phrase);
            }
        })
    })
    */
});
