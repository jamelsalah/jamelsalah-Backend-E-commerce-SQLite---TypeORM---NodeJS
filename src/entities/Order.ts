import {
    Entity, PrimaryGeneratedColumn,
    Index, JoinColumn,
    Column, ManyToOne, OneToMany
} from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

export enum PaymentStatus {
    PENDING = "pending",           // QR Code gerado, aguardando pagamento
    PAID = "paid",                 // Asaas confirmou o PIX
    FAILED = "failed",             // Pagamento falhou ou expirou
}

export enum OrderStatus {
    ANALYZING = "analyzing",       // Em análise pelo admin
    APPROVED = "approved",         // Aprovado pelo admin
    DISPATCHED = "dispatched",     // Despachado
    ON_THE_WAY = "on_the_way",     // A caminho
    DELIVERED = "delivered",       // Entregue
    CANCELED = "canceled",         // Cancelado
}

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    date!: Date;

    @Column()
    user_id!: number;

    @Column("integer")
    price!: number;

    @Column({ default: "pix" })
    payment_method!: string;

    @Column()
    shipping_postal_code!: number;

    @Column()
    shipping_city!: string;

    @Column()
    shipping_state!: string;

    @Column()
    shipping_address!: string;

    @Column()
    shipping_number!: string;

    @Column({ type: "varchar", nullable: true })
    shipping_complement!: string | null;

    @Column({ type: "varchar", nullable: true })
    fiscal_note!: string | null;

    @Column({
        type: "text",
        default: PaymentStatus.PENDING
    })
    payment_status!: PaymentStatus;

    @Column({
        type: "text",
        default: OrderStatus.ANALYZING
    })
    status!: OrderStatus;

    @Column({ type: "varchar", nullable: true })
    asaas_payment_id!: string | null;

    @Index()
    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => OrderItem, (item: OrderItem) => item.order, {
        cascade: true
    })
    items!: OrderItem[];
}
