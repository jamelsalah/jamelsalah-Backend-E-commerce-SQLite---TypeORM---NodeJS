import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from "typeorm";
import { Product } from "./Product";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({default: 1})
    relevance!: number;

    @DeleteDateColumn({ type: "datetime", nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => Product, (product: Product) => product.category)
    products!: Product[];
}