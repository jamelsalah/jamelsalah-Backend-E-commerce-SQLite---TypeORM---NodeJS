import {
    Entity, PrimaryGeneratedColumn,
    Column, ManyToOne, JoinColumn, Index
} from "typeorm";
import { Order } from "./Order";

@Entity()
export class OrderItem {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    order_id!: number;

    @Column({ type: "int", nullable: true })
    product_id!: number | null;

    @Column()
    product_name!: string;

    @Column("integer")
    unit_price!: number;

    @Column()
    quantity!: number;

    @Column()
    product_img_url!: string;

    @Index()
    @ManyToOne(() => Order, (order: Order) => order.items, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "order_id" })
    order!: Order;
}
