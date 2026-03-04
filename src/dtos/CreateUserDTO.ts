import { IsEmail, IsNotEmpty, Length, IsOptional, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { IsCPF } from "../utils/validators/IsCPF";

export class CreateUserDTO {

    @IsNotEmpty()
    @Length(6, 20)
    username!: string;

    @IsNotEmpty()
    @Length(6, 20)
    password!: string;

    @Length(6, 60)
    name!: string;

    @IsNotEmpty()
    @IsCPF()
    cpf!: string;

    @IsNotEmpty()
    @Length(7)
    rg!: string;

    @IsNotEmpty()
    @Length(12, 40)
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    birthday!: Date;

    @IsNotEmpty()
    @Length(11)
    tel1!: string;

    @IsOptional()
    tel2?: string;

    @IsOptional()
    sellerId?: number;
}