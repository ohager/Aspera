import {CryptoService} from '../crypto.service';
import TestDictionary from '../../util/crypto/passPhraseGenerator/testDictionary';
import {async, inject, TestBed} from '@angular/core/testing';
import {DICTIONARY} from '../../util/crypto/passPhraseGenerator/dictionary';

describe('CryptoService', () => {


    beforeEach(() => {

        TestBed.configureTestingModule({
            providers: [
                CryptoService,
                {provide: DICTIONARY, useValue: new TestDictionary()}
            ]
        });
    });

    it('should be created', inject([CryptoService], (service: CryptoService) => {
            expect(service).not.toBeNull();
            expect(service).toBeTruthy();
        })
    );

    describe('generatePassphrase', () => {
        it('should generate a single nice passphrase (12 tokens)',
            async(inject([CryptoService], async (service: CryptoService) => {
                    const passphrase = await service.generatePassPhrase();
                    expect(passphrase).not.toBeNull();
                    expect(passphrase.length).toBe(12);
                    // minimum expected lower bound
                    expect(passphrase.join('').length).toBeGreaterThan(12 * 4);

                })
            )
        );

        it('should generate a single nice passphrase (12 tokens) using an arbitray seed',
            async(inject([CryptoService], async (service: CryptoService) => {
                    const passphrase = await service.generatePassPhrase(['111', '234324']);
                    expect(passphrase).not.toBeNull();
                    expect(passphrase.length).toBe(12);
                    // minimum expected lower bound
                    expect(passphrase.join('').length).toBeGreaterThan(12 * 4);

                })
            )
        );

        it('should generate several different passphrases',
            async(inject([CryptoService], async (service: CryptoService) => {
                    let passphrases = new Set();
                    for (let i = 0; i < 10; ++i) {
                        const passphraseTokens = await service.generatePassPhrase();
                        const phrase = passphraseTokens.join('');
                        expect(passphrases.has(phrase)).toBeFalsy();
                        passphrases.add(phrase);
                    }
                })
            )
        );
    }); // generatePassPhrase
});
