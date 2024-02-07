import { WalletTransaction } from "../model/Transaction"
import { CurrencyDTO } from "./CurrencyDTO"
import { WalletDTO } from "./WalletDTO"

export class TransactionDTO {
    
    constructor(        
        public id : number,
        public amount: number,
        public amountBRL: number,
        public isCredit: boolean,
        public isRefunded: boolean,
        public currency: CurrencyDTO,
        public wallet: WalletDTO,
        public createdAt: Date,
        public refundedAt: Date,
    ){}

    static fromModel(transaction: WalletTransaction): TransactionDTO {
        const transactionDTO = new TransactionDTO(
            transaction.id,
            transaction.amount,
            transaction.amountBRL,
            transaction.isCredit,
            transaction.isRefunded,
            transaction.currency,
            transaction.wallet,
            transaction.createdAt,
            transaction.refundedAt,
        )

        return transactionDTO
    }

    static fromModelWithSum(transaction: WalletTransaction): TransactionDTO {

        const transactionDTO = new TransactionDTO(
            undefined,
            transaction.amount,
            undefined,
            undefined,
            undefined,
            transaction.currency,
            undefined,
            undefined,
            undefined,
        )

        return transactionDTO
    }

    toModel(): WalletTransaction {

        let newWalletTransaction = new WalletTransaction();
        newWalletTransaction.amount = this.amount,
        newWalletTransaction.amountBRL = this.amountBRL,
        newWalletTransaction.isCredit = this.isCredit,
        newWalletTransaction.isRefunded = this.isRefunded,
        newWalletTransaction.currency = this.currency,
        newWalletTransaction.wallet = this.wallet,
        newWalletTransaction.createdAt = this.createdAt
        newWalletTransaction.refundedAt = this.refundedAt

        return newWalletTransaction;
    }

}

