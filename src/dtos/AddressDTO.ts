import { IsString, IsOptional, IsNumber, Length } from "class-validator";
import { Type } from "class-transformer";

export class CreateAddressDTO {

    @IsNumber()
    @Type(() => Number)
    postal_code!: number;

    @IsString()
    city!: string;

    @IsString()
    state!: string;

    @IsString()
    address!: string;
    
    @IsString()
    @Length(1, 8)
    number!: string;

    @IsString()
    @IsOptional()
    complement?: string;
}

export class UpdateAddressDTO {

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    postal_code?: number;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    @Length(1, 20)
    number?: string;

    @IsString()
    @IsOptional()
    complement?: string;
}