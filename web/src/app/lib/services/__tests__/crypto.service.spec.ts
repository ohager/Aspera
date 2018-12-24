import {CryptoService} from '../crypto.service';
import TestDictionary from '../../util/crypto/passPhraseGenerator/testDictionary';

describe('CryptoService', () => {

    let service: CryptoService = new CryptoService();

    it('should be created', () => {
        expect(service).not.toBeNull();
    });

    describe('generatePassphrase', () => {
        it('should generate a single nice passphrase (12 tokens)', async () => {
            const passphrase = await service.generatePassPhrase([], new TestDictionary());
            expect(passphrase).not.toBeNull();
            expect(passphrase.length).toBe(12);
            // minimum expected lower bound
            expect(passphrase.join('').length).toBeGreaterThan(12 * 4);
        });

        it('should generate several different passphrases', async () => {
            let passphrases = new Set();
            for (let i = 0; i < 10; ++i) {
                const passphraseTokens = await service.generatePassPhrase([], new TestDictionary());
                const phrase = passphraseTokens.join('');
                expect(passphrases.has(phrase)).toBeFalsy();
                passphrases.add(phrase);
            }
        })
    })
});
