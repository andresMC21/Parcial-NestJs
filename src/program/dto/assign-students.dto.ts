// TODO Reto 2: reglas de validación con class-validator
//   - studentIds: arreglo NO vacío, cada elemento debe ser un UUID


import { ArrayNotEmpty, IsArray, IsEmail } from "class-validator";

export class AssignStudentsDto {

    @IsArray()
    @ArrayNotEmpty()
    @IsEmail({}, { each: true })
    studentIds: string[];

}
