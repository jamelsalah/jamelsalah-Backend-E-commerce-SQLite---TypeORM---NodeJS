import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToMany, ManyToOne, Index, JoinColumn, OneToOne
} from "typeorm";
import { Address} from "./Address"
import { Cart } from "./Cart";
import { UserRole } from "../types/UserRole";
import { encrypt, decrypt } from "../utils/crypto";

const sensitiveTransformer = {
    to: (value: string) => encrypt(value),
    from: (value: string) => decrypt(value),
};

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column({ transformer: sensitiveTransformer })
    cpf!: string;

    @Column({ transformer: sensitiveTransformer })
    rg!: string;

    @Column({ type: "date" })
    birthday!: Date;

    @Column()
    tel1!: string;

    @Column({ type: "varchar", nullable: true })
    tel2!: string | null;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

    @Column({ nullable: true })
    seller_id!: number | null;

    @Column({
        type: "text",
        default: UserRole.CUSTOMER
    })
    role!: UserRole;

    @Column({ type: "varchar", nullable: true })
    asaas_customer_id!: string | null;

    @OneToMany(() => Address, (address: Address) => address.user, {
        cascade: true
    })
    address!: Address[];

    @OneToOne(() => Cart, (cart: Cart) => cart.user, {
        cascade: true
    })
    cart!: Cart;

    @ManyToOne(() => User, (user: User) => user.customers, {
        onDelete: "SET NULL",
        nullable: true
    })
    @JoinColumn({ name: "seller_id" })
    seller!: User | null;

    @OneToMany(() => User, (user: User) => user.seller)
    customers!: User[];
}
