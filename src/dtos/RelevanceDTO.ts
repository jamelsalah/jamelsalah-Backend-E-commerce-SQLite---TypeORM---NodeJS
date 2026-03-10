import { IsIn } from "class-validator";

export class UpdateRelevanceDTO {

    @IsIn(["increment", "decrement"])
    action!: "increment" | "decrement";
}
