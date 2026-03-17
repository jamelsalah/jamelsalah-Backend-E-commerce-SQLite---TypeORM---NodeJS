import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, Index, JoinColumn
} from "typeorm";
import { Category } from "./Category";
import { Image } from "./Image";
import { CartItem } from "./CartItem";

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    img_url!: string;

    @Column()
    name!: string;

    @Column()
    desc!: string;

    @Column({ select: false, default: "" })
    details!: string;

    @Column("integer")
    price!: number;

    @Column("integer", {nullable: true})
    promo!: number | null;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

    @Column()
    category_id!: number;

    @Column({nullable: true})
    sub_category_id!: number | null;

    @Column({default: 1})
    relevance!: number;

    @Index()
    @ManyToOne(() => Category, (category: Category) => category.products, {
        onDelete: "RESTRICT"
    })
    @JoinColumn({ name: "category_id" })
    category!: Category;

    @Index()
    @ManyToOne(() => Category, (category: Category) => category.products, {
        onDelete: "RESTRICT"
    })
    @JoinColumn({ name: "sub_category_id" })
    sub_category!: Category | null;

    @OneToMany(() => Image, (image: Image) => image.product, {
        cascade: true
    })
    images!: Image[];

    @OneToMany(() => CartItem, (item: CartItem) => item.product)
    cartItems!: CartItem[];
}