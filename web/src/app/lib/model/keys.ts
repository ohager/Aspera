/*
* Copyright 2018 PoC-Consortium
*/

/*
* Keys class
*
* The Keys class is used to encompass keys associated to an account.
*/
export class Keys {
    public agreementPrivateKey: string;
    public publicKey: string;
    public signPrivateKey: string;

    constructor(publicKey: string, agreementPrivateKey: string, signPrivateKey: string) {
        this.agreementPrivateKey = agreementPrivateKey;
        this.publicKey = publicKey;
        this.signPrivateKey = signPrivateKey;
    }
}
