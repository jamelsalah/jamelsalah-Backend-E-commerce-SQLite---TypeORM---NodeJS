import {
    IsString,
    IsNumber,
    IsInt,
    IsOptional,
    IsUrl,
    Min,
    IsDate,
    IsArray
} from "class-validator";

import { Type } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";


export class CreateProductDTO {

    @IsString()
    name!: string

    @IsString()
    desc!: string

    @IsOptional()
    @IsString()
    details?: string

    @IsInt()
    @Min(0)
    @Type(() => Number)
    @JSONSchema({ description: "Preço em centavos (ex: 1050 = R$ 10,50)" })
    price!: number

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @JSONSchema({ description: "Preço promocional em centavos" })
    promo?: number

    @IsNumber()
    @Type(() => Number)
    category_id!: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    subcategory_id?: number

    @IsUrl()
    img_url!: string

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    images?: string[]

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    relevance?: number
}

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    desc?: string

    @IsOptional()
    @IsString()
    details?: string

    @IsOptional()
    @IsUrl()
    img_url?: string


    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @JSONSchema({ description: "Preço em centavos (ex: 1050 = R$ 10,50)" })
    price?: number

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @JSONSchema({ description: "Preço promocional em centavos" })
    promo?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    category_id?: number

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    subcategory_id?: number

    @IsOptional()
    @IsDate()
    promo_limit?: Date

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    images?: string[]

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    relevance?: number
}

