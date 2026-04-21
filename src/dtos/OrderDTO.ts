import { IsEnum } from "class-validator";
import { OrderStatus } from "../entities/Order";

export class UpdateOrderStatusDTO {

    @IsEnum(OrderStatus)
    status!: OrderStatus;
}
