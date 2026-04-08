import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class CheckoutDTO {

    @IsNumber()
    @Type(() => Number)
    addressId!: number;
}
