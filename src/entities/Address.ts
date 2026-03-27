import { Entity, PrimaryGeneratedColumn, 
    Column, ManyToOne, Index, JoinColumn
} from "typeorm";

import { User } from "./User"

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    postal_code!: number;

    @Column()
    city!: string;

    @Column()
    state!: string;

    @Column()
    address!: string;

    @Column()
    number!: string;

    @Column({ nullable: true })
    complement!: string

    @Column()
    user_id!: number

    @Index()
    @ManyToOne(() => User, (user: User) => user.address, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;
}