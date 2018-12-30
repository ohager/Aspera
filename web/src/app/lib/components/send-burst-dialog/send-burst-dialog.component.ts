import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Account, Transaction, EncryptedMessage} from '../../model';
import {CryptoService, AccountService} from '../../services';


@Component({
    selector: 'app-send-burst-dialog',
    templateUrl: './send-burst-dialog.component.html',
    styleUrls: ['./send-burst-dialog.component.css']
})
export class SendBurstDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<SendBurstDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        public cryptoService: CryptoService,
        public accountService: AccountService) {
    }

    public closeDialog(): void {
        this.dialogRef.close();
    }

    public ngOnInit() {

    }

    public async sendBurst(transactionRequest) {
        const {transaction, pin} = transactionRequest;
        let transactionToSend: Transaction = {
            senderPublicKey: this.data.account.keys.publicKey,
            ...transaction
        };

        // todo: move to service
        if (transactionToSend.attachment && transactionToSend.attachment.encryptedMessage) {
            const recipientPublicKey = await this.accountService.getAccountPublicKey(transaction.recipientAddress);
            transactionToSend.attachment = await this.cryptoService.encryptMessage(
                transactionToSend.attachment.encryptedMessage,
                recipientPublicKey,
                this.data.account.keys.agreementPrivateKey,
                this.accountService.hashPinEncryption(pin),
            );
        }
        return this.accountService.doTransaction(
            transactionToSend,
            this.data.account.keys.signPrivateKey,
            pin
        ).then((transaction: Transaction) => {
            console.log(transaction);
            this.closeDialog();
        });
    }


    public sendMessage(transactionRequest) {
        const {transaction, pin} = transactionRequest;
        let transactionToSend: Transaction = {
            senderPublicKey: this.data.account.keys.publicKey,
            ...transaction
        };

        return this.accountService.sendMessage(transactionToSend, this.data.account.keys.signPrivateKey, pin).then((transaction: Transaction) => {
            console.log(transaction);
            this.closeDialog();
        });
    }

    public sendBurstMultiOut(transactionRequest) {
        const {transaction, pin, sameAmount} = transactionRequest;
        let transactionToSend: Transaction = {
            senderPublicKey: this.data.account.keys.publicKey,
            ...transaction
        };
        return this.accountService.doMultiOutTransaction(transactionToSend, this.data.account.keys.signPrivateKey, pin, sameAmount).then((transaction: Transaction) => {
            console.log(transaction);
            this.closeDialog();
        });
    }

}
