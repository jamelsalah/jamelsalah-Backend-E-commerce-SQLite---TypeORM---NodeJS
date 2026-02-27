import {
    Entity, PrimaryGeneratedColumn, OneToOne,
    OneToMany, Index, JoinColumn,
    Column
} from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity()
export class Cart {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id!: number;

    @Index()
    @OneToOne(() => User, (user: User) => user.cart, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => CartItem, item=> item.cart, {
        cascade: true
    })
    items!: CartItem[]
}