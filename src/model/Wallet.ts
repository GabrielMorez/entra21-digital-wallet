import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { CurrencyDTO } from "../dto/CurrencyDTO";
import { UserDTO } from "../dto/UserDTO";
import { Currency } from "./Currency";
import { User } from "./User";

@Entity()
export class Wallet {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @ManyToOne(() => Currency, (currency) => currency)
    currency: CurrencyDTO;

    @ManyToOne(() => User, (user) => user)
    user: UserDTO;
}

