import {CryptoService} from '../crypto.service';
import TestDictionary from '../../util/crypto/passPhraseGenerator/testDictionary';
import {async, inject, TestBed} from '@angular/core/testing';
import {DICTIONARY} from '../../util/crypto/passPhraseGenerator/dictionary';


const withCryptoService = (asyncFn) => async(inject([CryptoService], asyncFn));


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
            withCryptoService(async (service: CryptoService) => {
                const passphrase = await service.generatePassPhrase();
                expect(passphrase).not.toBeNull();
                expect(passphrase.length).toBe(PHRASE_TOKEN_COUNT);
                // minimum expected lower bound
                expect(passphrase.join('').length).toBeGreaterThan(PHRASE_TOKEN_COUNT * 4);

            })
        );

        it('should generate a single nice passphrase (12 tokens) using an arbitrary seed',
            withCryptoService(async (service: CryptoService) => {
                const passphrase = await service.generatePassPhrase(['111', '234324']);
                expect(passphrase).not.toBeNull();
                expect(passphrase.length).toBe(PHRASE_TOKEN_COUNT);
                // minimum expected lower bound
                expect(passphrase.join('').length).toBeGreaterThan(PHRASE_TOKEN_COUNT * 4);

            })
        );

        it('should generate several different passphrases',
            withCryptoService(async (service: CryptoService) => {
                let passphrases = new Set();
                for (let i = 0; i < 10; ++i) {
                    const passphraseTokens = await service.generatePassPhrase();
                    const phrase = passphraseTokens.join('');
                    expect(passphrases.has(phrase)).toBeFalsy();
                    passphrases.add(phrase);
                }
            })
        );
    }); // generatePassPhrase


    describe('getAccountIdFromPublicKey', () => {
        it('should convert public key to account id',
            withCryptoService(async (service: CryptoService) => {
                // FIXME: use a public key from POCC members, or involved devs
                const accountId = await service.getAccountIdFromPublicKey(
                    'c70302ae096311b9fde9f82ac02db2015842aa90c2b46142965694643ff8b964'
                );
                expect(accountId).toBe('6519831686360358854')
            })
        );

        it('should throw exception on null/undefined',
            withCryptoService(async (service: CryptoService) => {
                try {
                    await service.getAccountIdFromPublicKey(null);
                } catch (e) {
                    // TODO: more consistent error object
                    expect(e).not.toBeNull();
                    expect(e).toEqual(new Error('Invalid public key'));
                }
            })
        );
    }); // getAccountIdFromPublicKey

    describe('getBurstAddressFromAccountId', () => {
        it('should convert account id to BURST address',
            withCryptoService(async (service: CryptoService) => {
                const burstAddress = await service.getBurstAddressFromAccountId('14621387788563312512');
                expect(burstAddress).toBe('BURST-TVW2-R9QA-VBYR-EUEUP') // test net account
            })
        );

    }); // getBurstAddressFromAccountId

    describe('encryptAES/decryptAES', () => {
        it('should encrypt as expected',
            withCryptoService(async (service: CryptoService) => {
                const encryptedBase64 = await service.encryptAES('test message', 'passphrase');
                expect(encryptedBase64).not.toBeNull();
                expect(encryptedBase64.length).toBeGreaterThan(0);
                expect(() => atob(encryptedBase64)).not.toThrow();
                expect(atob(encryptedBase64)).not.toBe('test message');

            })
        );
        it('should decrypt as expected',
            withCryptoService(async (service: CryptoService) => {
                const encryptedBase64 = await service.encryptAES('test message', 'passphrase');
                const decrypted = await service.decryptAES(encryptedBase64, 'passphrase');
                expect(decrypted).toBe('test message');
            })
        )
    }); // encryptAES/decryptAES

    describe('encryptMessage', () => {
        it('should encrypt message as expected',
            withCryptoService(async (service: CryptoService) => {
                const encryptedMessage = await service.encryptMessage(
                    'message to be encrypted',
                    'encryptedPrivateKey',
                    '1234567',
                    'recipientPublicKey'
                );
                expect(encryptedMessage).not.toBeNull()
            })
        )
    }); // encryptMessage

});
