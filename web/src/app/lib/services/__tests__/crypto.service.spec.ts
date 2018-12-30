import {CryptoService} from '../crypto.service';
import TestDictionary from '../../util/crypto/passPhraseGenerator/testDictionary';
import {async, inject, TestBed} from '@angular/core/testing';
import {DICTIONARY} from '../../util/crypto/passPhraseGenerator/dictionary';
import {ECKCDSA} from '../../util/crypto';
import {Converter} from '../../util';
import CryptoJS = require('crypto-js');


const withCryptoService = (asyncFn) => async(inject([CryptoService], asyncFn));


describe('CryptoService', () => {

    const PHRASE_TOKEN_COUNT = 12;
    let alicePublicKey: string;
    let alicePrivateKeyEncrypted: string;
    const alicePinHash = 'alicePinHash';

    let bobPublicKey: string;
    let bobPrivateKeyEncrypted: string;
    const bobPinHash = 'bobPinHash';

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                CryptoService,
                {provide: DICTIONARY, useValue: new TestDictionary()}
            ]
        });

        const aliceKey = ECKCDSA.keygen('28c4df6f30b293e3db4631d11cc1c076'.split(''));
        const alicePrivateKey = Converter.convertByteArrayToHexString(aliceKey.k);
        alicePublicKey = Converter.convertByteArrayToHexString(aliceKey.p);
        alicePrivateKeyEncrypted = await CryptoService.encryptAES(alicePrivateKey, alicePinHash);

        const bobKey = ECKCDSA.keygen('edc23425f6281aeffe87431ffefa57af'.split(''));
        const bobPrivateKey = Converter.convertByteArrayToHexString(bobKey.k);
        bobPublicKey = Converter.convertByteArrayToHexString(bobKey.p);
        bobPrivateKeyEncrypted = await CryptoService.encryptAES(bobPrivateKey, bobPinHash);

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

    describe('generateMasterKeys', () => {
        it('should generate master keys',
            withCryptoService(async (service: CryptoService) => {
                const keys = await service.generateMasterKeys('test passphrase');
                const {agreementPrivateKey, publicKey, signPrivateKey} = keys;
                expect(agreementPrivateKey).not.toBeNull();
                expect(agreementPrivateKey.length).toBe(64);
                expect(publicKey).not.toBeNull();
                expect(publicKey.length).toBe(64);
                expect(publicKey).not.toBe(agreementPrivateKey);
                expect(publicKey).not.toBe(signPrivateKey);
                expect(signPrivateKey).not.toBeNull();
                expect(signPrivateKey.length).toBe(64);
                expect(signPrivateKey).not.toBe(agreementPrivateKey);

            })
        );
    }); // generateMasterKeys


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

    describe('getAccountIdFromBurstAddress', () => {
        it('should convert BURST address to account id',
            withCryptoService(async (service: CryptoService) => {
                const burstAddress = await CryptoService.getAccountIdFromBurstAddress('BURST-TVW2-R9QA-VBYR-EUEUP');
                expect(burstAddress).toBe('14621387788563312512') // test net account
            })
        );

        it('should throw exception on invalid address #1',
            withCryptoService(async (service: CryptoService) => {
                try {
                    await CryptoService.getAccountIdFromBurstAddress('TVW2-R9QA-VBYR-EUEUP');
                    fail('Expected exception!');
                } catch (e) {
                    expect(e).toBe('Invalid BURST address: TVW2-R9QA-VBYR-EUEUP')
                }
            })
        );

        it('should throw exception on empty address #2',
            withCryptoService(async (service: CryptoService) => {
                try {
                    await CryptoService.getAccountIdFromBurstAddress('');
                    fail('Expected exception!');
                } catch (e) {
                    expect(e).toBe('Invalid BURST address: ')
                }
            })
        );

    }); // getBurstAddressFromAccountId

    describe('encryptAES/decryptAES', () => {
        it('should encrypt as expected',
            withCryptoService(async (service: CryptoService) => {
                const encryptedBase64 = await CryptoService.encryptAES('test message', 'passphrase');
                expect(encryptedBase64).not.toBeNull();
                expect(encryptedBase64.length).toBeGreaterThan(0);
                expect(() => atob(encryptedBase64)).not.toThrow();
                expect(atob(encryptedBase64)).not.toBe('test message');

            })
        );
        it('should decrypt as expected',
            withCryptoService(async (service: CryptoService) => {
                const encryptedBase64 = await CryptoService.encryptAES('test message', 'passphrase');
                const decrypted = await CryptoService.decryptAES(encryptedBase64, 'passphrase');
                expect(decrypted).toBe('test message');
            })
        )
    }); // encryptAES/decryptAES

    describe('encryptMessage/decryptMessage', () => {
        it('should encrypt message as expected',
            withCryptoService(async (service: CryptoService) => {
                // bob sends o alice
                const encryptedMessage = await service.encryptMessage(
                    'Message to be encrypted',
                    alicePublicKey,
                    bobPrivateKeyEncrypted,
                    bobPinHash,
                );
                expect(encryptedMessage).not.toBeNull();
                expect(encryptedMessage.isText).toBeTruthy();
                expect(encryptedMessage.data).not.toBeNull();
                expect(encryptedMessage.data.length).toBeGreaterThan(0);
                expect(encryptedMessage.nonce).not.toBeNull();
                expect(encryptedMessage.nonce.length).toBeGreaterThan(0);
                expect(() => CryptoJS.enc.Hex.parse(encryptedMessage.nonce)).not.toThrow();
                const tokens = encryptedMessage.data.split(':');
                expect(tokens.length).toBe(2);
                expect(() => CryptoJS.enc.Base64.parse(tokens[0])).not.toThrow();
                expect(() => CryptoJS.enc.Base64.parse(tokens[1])).not.toThrow();
            })
        );

        it('should decrypt message as expected',
            withCryptoService(async (service: CryptoService) => {

                // bob sends message to alice
                const encryptedMessage = await service.encryptMessage(
                    'message to be encrypted',
                    alicePublicKey,
                    bobPrivateKeyEncrypted,
                    bobPinHash
                );

                // alice reads message from bob
                const message = await service.decryptMessage(
                    encryptedMessage,
                    bobPublicKey,
                    alicePrivateKeyEncrypted,
                    alicePinHash
                );

                expect(message).toBe('message to be encrypted');
            })
        );

        it('should throw exception on malformed encrypted message ',
            withCryptoService(async (service: CryptoService) => {

                const aliceKey = ECKCDSA.keygen('28c4df6f30b293e3db4631d11cc1c076'.split(''));
                const alicePublicKey = Converter.convertByteArrayToHexString(aliceKey.p);
                const alicePrivateKey = Converter.convertByteArrayToHexString(aliceKey.k);
                const alicePrivateKeyEnc = await CryptoService.encryptAES(alicePrivateKey, 'alicePinHash');

                const bobKey = ECKCDSA.keygen('edc23425f6281aeffe87431ffefa57af'.split(''));
                const bobPublicKey = Converter.convertByteArrayToHexString(bobKey.p);
                const bobPrivateKey = Converter.convertByteArrayToHexString(bobKey.k);
                const bobPrivateKeyEnc = await CryptoService.encryptAES(bobPrivateKey, 'bobPinHash');

                // bob sends message to alice
                const encryptedMessage = await service.encryptMessage(
                    'message',
                    alicePublicKey,
                    bobPrivateKeyEnc,
                    'bobPinHash'
                );

                // synthetically removing IV delimiter
                encryptedMessage.data = encryptedMessage.data.replace(':', '');

                try {
                    // alice reads message from bob
                    const message = await service.decryptMessage(
                        encryptedMessage,
                        bobPublicKey,
                        alicePrivateKeyEnc,
                        'alicePinHash'
                    );
                    expect(false).toBeTruthy(); // should not hit here
                } catch (e) {
                    // no op
                    expect(e.message).toBe('Invalid message format')
                }

            })
        );

    }); // encryptMessage/decryptMessage


    // TODO: review these methods
    describe('generateSignature/verifySignature', () => {
        it('should generate signature as expected',
            withCryptoService(async (service: CryptoService) => {
                const pinHash = 'pinHash';
                const transactionHex = 'edc23425f6281aeffe87431ffefa57af28c4df6f30b293e3db4631d11cc1c076';
                const encryptedPrivateKey = await CryptoService.encryptAES('privateKey', pinHash);

                const signature = await service.generateSignature(
                    transactionHex,
                    encryptedPrivateKey,
                    pinHash,
                );
                expect(signature).not.toBeNull();
                expect(signature.length).toBe(128);
            })
        );
        xit('should verify signature as expected',
            withCryptoService(async (service: CryptoService) => {
                // FIXME: how to test?
            })
        );
    });

    describe('generateSignedTransactionBytes', () => {
        it('should generate expected',
            withCryptoService(async (service: CryptoService) => {
                const pinHash = 'pinHash';
                const transactionHex = 'edc23425f6281aeffe87431ffefa57af28c4df6f30b293e3db4631d11cc1c076';
                const encryptedPrivateKey = await CryptoService.encryptAES('privateKey', pinHash);
                const signature = await service.generateSignature(
                    transactionHex,
                    encryptedPrivateKey,
                    pinHash,
                );

                const bytes = await service.generateSignedTransactionBytes(transactionHex, signature);
                expect(bytes).not.toBeNull();
                expect(bytes.length).toBe(192);
            })
        );
    });

    describe('hashSHA256', () => {
        it('should generate SHA256 as expected',
            inject([CryptoService], (service: CryptoService) => {
                const hash = CryptoService.hashSHA256('foobar');
                expect(hash).not.toBeNull();
                expect(hash).toBe('c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');
            })
        );
    });

});
