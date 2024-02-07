import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CurrencyDTO } from "../dto/CurrencyDTO";
import { WalletDTO } from "../dto/WalletDTO";
import { Wallet } from "./Wallet";
import { Currency } from "./Currency";

@Entity()
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Currency, (currency) => currency)
  currency: CurrencyDTO;

  @ManyToOne(() => Wallet, (wallet) => wallet)
  wallet: WalletDTO;

  @Column({type: "numeric"})
  amount: number

  @Column({type: "numeric"})
  amountBRL: number

  @Column()
  isCredit: boolean;

  @Column()
  isRefunded: boolean;

  @Column()
  createdAt: Date;

  @Column({
    nullable: true
  })
  refundedAt: Date;
}
