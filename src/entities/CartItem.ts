import {
  Entity, PrimaryGeneratedColumn, Column, JoinColumn,
  ManyToOne, Index
} from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity()
@Index(["cart", "product"], { unique: true })
export class CartItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    quantity!: number;

    @Column()
    cart_id!: number;

    @Column()
    product_id!: number;

    @Index()
    @ManyToOne(() => Cart, (cart: Cart) => cart.items, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "cart_id" })
    cart!: Cart;

    @Index()
    @ManyToOne(() => Product, (product: Product) => product.cartItems, {
        onDelete: "RESTRICT"
    })
    @JoinColumn({ name: "product_id" })
    product!: Product;
}

