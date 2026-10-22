import { IsInt, IsPositive, IsString, MinLength } from "class-validator";

export class CreateCampusDto {

    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    city: string;

    @IsInt()
    @IsPositive()
    capacity: number;
}
