import { 
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, Index, JoinColumn
} from "typeorm";
import { Product } from "./Product";


@Entity()
export class Image {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    url!: string;

    @Column()
    product_id!: number;

    @Index()
    @ManyToOne(() => Product, (product: Product) => product.images, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "product_id" })
    product!: Product
}