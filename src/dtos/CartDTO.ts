import { IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddToCartDTO {

    @IsNumber()
    @Type(() => Number)
    productId!: number

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity!: number
}

