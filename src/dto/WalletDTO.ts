import { Wallet } from "../model/Wallet";
import { CurrencyDTO } from "./CurrencyDTO";
import { UserDTO } from "./UserDTO";

export class WalletDTO {
    
    constructor(
        public id: number,
        public name: string,
        public user: UserDTO,
        public currency: CurrencyDTO,
    ) {}

    static fromModel(wallet: Wallet): WalletDTO {

        const walletDTO = new WalletDTO(
            wallet.id,
            wallet.name,
            wallet.user,
            wallet.currency
        );

        return walletDTO;
    }

    toModel(): Wallet {

        let newWallet = new Wallet();
        newWallet.name = this.name;
        newWallet.user = this.user;
        newWallet.currency = this.currency;

        return newWallet;
    }
}