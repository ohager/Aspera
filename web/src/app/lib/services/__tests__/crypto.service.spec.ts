import {CryptoService} from '../crypto.service';
import TestDictionary from '../../util/crypto/passPhraseGenerator/testDictionary';
import {async, inject, TestBed} from '@angular/core/testing';
import {DICTIONARY} from '../../util/crypto/passPhraseGenerator/dictionary';

describe('CryptoService', () => {

    const PHRASE_TOKEN_COUNT = 12;


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
                    expect(passphrase.length).toBe(PHRASE_TOKEN_COUNT);
                    // minimum expected lower bound
                    expect(passphrase.join('').length).toBeGreaterThan(PHRASE_TOKEN_COUNT * 4);

                })
            )
        );

        it('should generate a single nice passphrase (12 tokens) using an arbitrary seed',
            async(inject([CryptoService], async (service: CryptoService) => {
                    const passphrase = await service.generatePassPhrase(['111', '234324']);
                    expect(passphrase).not.toBeNull();
                    expect(passphrase.length).toBe(PHRASE_TOKEN_COUNT);
                    // minimum expected lower bound
                    expect(passphrase.join('').length).toBeGreaterThan(PHRASE_TOKEN_COUNT * 4);

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


    describe('getAccountIdFromPublicKey', () => {
        it('should convert public key to account id',
            async(inject([CryptoService], async (service: CryptoService) => {
                    // TODO: use a publickKey from POCC members
                    const accountId = await service.getAccountIdFromPublicKey('c70302ae096311b9fde9f82ac02db2015842aa90c2b46142965694643ff8b964');
                    expect(accountId).toBe('6519831686360358854')
                })
            )
        );

        it('should throw exception on null/undefined',
            async(inject([CryptoService], async (service: CryptoService) => {
                try {
                    await service.getAccountIdFromPublicKey(null);
                } catch (e) {
                    // TODO: more consistent error object
                    expect(e).not.toBeNull();
                    expect(e).toEqual(new Error('Invalid public key'));
                }
            })
        ));
    });

    describe('getBurstAddressFromAccountId', () => {
        it('should convert account id to BURST address',
            async(inject([CryptoService], async (service: CryptoService) => {
                    // TODO: use a publickKey from POCC members
                    const burstAddress = await service.getBurstAddressFromAccountId('6519831686360358854');
                    expect(burstAddress).toBe('BURST-JRY8-E28F-S5GP-7SSYN')
                })
            )
        );

    });
});
