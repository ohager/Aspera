/*
* Copyright 2018 PoC-Consortium
*/

import {Inject, Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as BN from 'bn.js';
import {Converter} from '../util';
import {PassPhraseGenerator, ECKCDSA} from '../util/crypto';
import {EncryptedMessage, Keys} from '../model';
import {BurstUtil} from '../util';
import Dictionary, {DICTIONARY} from '../util/crypto/passPhraseGenerator/dictionary';

/*
* CryptoService class
*
* The CryptoService class takes care of everything crypto related.
*/
@Injectable()
export class CryptoService {


    private passPhraseGenerator: PassPhraseGenerator;

    /**
     * Convert Burst Address back to account id
     */
    public static getAccountIdFromBurstAddress(address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const id = BurstUtil.decode(address);
            if (!id) {
                reject(`Invalid BURST address: ${address}`)
            }
            resolve(id);
        })
    }

    /**
     * Encrypt a derived hd private key with a given pin and return it in Base64 form
     */
    public static encryptAES(text: string, key: string): Promise<string> {
        return Promise.resolve(CryptoJS.AES.encrypt(text, key).toString())
    }

    /**
     * Decrypt a derived hd private key with a given pin
     */
    public static decryptAES(encryptedBase64: string, key: string): Promise<string> {
        return Promise.resolve(CryptoJS.AES.decrypt(encryptedBase64, key).toString(CryptoJS.enc.Utf8));
    }

    /*
    * Hash string into hex string
    */
    public static hashSHA256(input: string): string {
        // FIXME: make this async, to be consistent
        return CryptoJS.SHA256(input).toString();
    }

    constructor(@Inject(DICTIONARY) private dictionary: Dictionary) {
        this.passPhraseGenerator = new PassPhraseGenerator(dictionary);
    }

    /*
    * Generate a passphrase with the help of the PassPhraseGenerator
    * pass optional seed for seeding generation
    */
    public generatePassPhrase(seed: any[] = []): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key and Master Private Key for a new passphrase
    * EC-KCDSA sign key pair + agreement key.
    */
    public generateMasterKeys(passPhrase: string): Promise<Keys> {
        return new Promise((resolve, reject) => {
            let hashedPassPhrase = CryptoJS.SHA256(passPhrase);
            let keys = ECKCDSA.keygen(Converter.convertWordArrayToByteArray(hashedPassPhrase));
            let keyObject: Keys = new Keys(
                Converter.convertByteArrayToHexString(keys.p),
                Converter.convertByteArrayToHexString(keys.k),
                Converter.convertByteArrayToHexString(keys.s)
            );
            resolve(keyObject);
        });
    }

    /*
    * Convert hex string of the public key to the account id
    */
    public getAccountIdFromPublicKey(publicKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!(publicKey && publicKey.length)) {
                throw new Error('Invalid public key')
            }
            // hash with SHA 256
            let hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            let bytes = Converter.convertWordArrayToByteArray(hash);
            // slice away first 8 bytes of SHA256 string
            let slice = bytes.slice(0, 8);
            // order it from lowest bit to highest / little-endian first / reverse
            slice = slice.reverse();
            // convert each byte into a number with radix 10
            let numbers = slice.map(byte => byte.toString(10));
            // create a biginteger based on the reversed byte/number array
            let id = new BN(numbers, 256); // base 256 for byte
            resolve(id.toString()); // return big integer in string
        });
    }

    /*
    * Convert the account id to the appropriate Burst address
    */
    public getBurstAddressFromAccountId(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: refactor shitty nxt address resolution
            resolve(BurstUtil.encode(id));
        });
    }

    public encryptMessage(text: string, recipientPublicKey: string, senderPrivateKeyEncrypted: string, senderPinHash: string): Promise<EncryptedMessage> {

        const senderPrivateKey = CryptoJS.AES.decrypt(senderPrivateKeyEncrypted, senderPinHash).toString(CryptoJS.enc.Utf8)
        const sharedKey =
            ECKCDSA.sharedkey(
                Converter.convertHexStringToByteArray(senderPrivateKey),
                Converter.convertHexStringToByteArray(recipientPublicKey)
            );

        // Randomize shared key
        const SHARED_KEY_SIZE = sharedKey.length;
        const randomBytes = CryptoJS.lib.WordArray.random(SHARED_KEY_SIZE);
        const randomNonce = Converter.convertWordArrayToUint8Array(randomBytes);
        for (let i = 0; i < SHARED_KEY_SIZE; i++) {
            sharedKey[i] ^= randomNonce[i];
        }
        const nonceHex = randomBytes.toString();
        const aeskey = Converter.convertByteArrayToHexString(sharedKey);

        const iv = CryptoJS.lib.WordArray.random(16);
        const encryptedTextBase64 = CryptoJS.AES.encrypt(text, aeskey, {iv}).toString();
        const encryptedMessage = new EncryptedMessage();
        // @ts-ignore
        encryptedMessage.data = `${iv.toString(CryptoJS.enc.Base64)}:${encryptedTextBase64}`;
        encryptedMessage.nonce = nonceHex;
        encryptedMessage.isText = true;

        return Promise.resolve(encryptedMessage);
    }

    public decryptMessage(encryptedMessage: EncryptedMessage, senderPublicKey: string, recipientPrivateKeyEncrypted: string, recipientPinHash: string) {

        const recipientPrivateKey = CryptoJS.AES.decrypt(recipientPrivateKeyEncrypted, recipientPinHash).toString(CryptoJS.enc.Utf8);
        let sharedKey =
            ECKCDSA.sharedkey(
                Converter.convertHexStringToByteArray(recipientPrivateKey),
                Converter.convertHexStringToByteArray(senderPublicKey)
            );

        // Randomize shared key
        const SHARED_KEY_SIZE = sharedKey.length;
        let nonceArray = Converter.convertWordArrayToUint8Array(CryptoJS.enc.Hex.parse(encryptedMessage.nonce));
        for (let i = 0; i < SHARED_KEY_SIZE; i++) {
            sharedKey[i] ^= nonceArray[i];
        }

        const aeskey = Converter.convertByteArrayToHexString(sharedKey);
        const tokens = encryptedMessage.data.split(':');
        if (tokens.length !== 2) {
            throw new Error('Invalid message format');
        }
        const iv = tokens[0];
        const text = CryptoJS.AES.decrypt(
            tokens[1],
            aeskey,
            {iv: btoa(iv)}
        ).toString(CryptoJS.enc.Utf8);
        return Promise.resolve(text);
    }


    /*
    * Generate signature for transaction
    * s = sign(sha256(sha256(transactionHex)_keygen(sha256(sha256(transactionHex)_privateKey)).publicKey),
    *          sha256(sha256(transactionHex)_privateKey),
    *          privateKey)
    * p = sha256(sha256(transactionHex)_keygen(sha256(transactionHex_privateKey)).publicKey)
    */
    public generateSignature(transactionHex: string, encryptedPrivateKey: string, pinHash: string): Promise<string> {
        return new Promise((resolve, reject) => {
            CryptoService.decryptAES(encryptedPrivateKey, pinHash)
                .then(privateKey => {
                    let s = Converter.convertHexStringToByteArray(privateKey);
                    let m = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(transactionHex)));
                    let m_s = m.concat(s);
                    let x = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(Converter.convertByteArrayToWordArray(m_s)));
                    let y = ECKCDSA.keygen(x).p;
                    let m_y = m.concat(y);
                    let h = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(Converter.convertByteArrayToWordArray(m_y)));
                    let v = ECKCDSA.sign(h, x, s);
                    resolve(Converter.convertByteArrayToHexString([].concat(v, h)));
                })
        });
    }


    /*
    * Verify signature for transaction
    * h1 = sha256(sha256(transactionHex)_keygen(sha256(transactionHex_privateKey)).publicKey)
    * ==
    * sha256(sha256(transactionHex)_verify(v, h1, publickey)) = h2
    */
    public verifySignature(signature: string, transactionHex: string, publicKey: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // get bytes
            let signatureBytes = Converter.convertHexStringToByteArray(signature);
            let publicKeyBytes = Converter.convertHexStringToByteArray(publicKey);
            let v = signatureBytes.slice(0, 32);
            let h1 = signatureBytes.slice(32);
            let y = ECKCDSA.verify(v, h1, publicKeyBytes);
            let m = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(transactionHex)));
            let m_y = m.concat(y);
            let h2 = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(Converter.convertByteArrayToWordArray(m_y)));
            // Convert to hex
            let h1hex = Converter.convertByteArrayToHexString(h1);
            let h2hex = Converter.convertByteArrayToHexString(h2);
            // compare
            resolve(h1hex === h2hex);
        });
    }

    /*
    * Concat signature with transactionHex
    */

    // TODO: need more context on this one here! - maybe unnecessary
    public generateSignedTransactionBytes(unsignedTransactionHex: string, signature: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: verification - duplicate?
            resolve(unsignedTransactionHex.substr(0, 192) + signature + unsignedTransactionHex.substr(320))
        });
    }
}
