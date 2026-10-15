import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { CreateProgramDto } from './dto/create-program.dto';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { Student } from 'src/student/entities/student.entity';

@Injectable()
export class ProgramService {

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
        private readonly studentRepository: Repository<Student>,
        private readonly datasource: DataSource
    ) { }

    // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
    //   - nombre o código repetido -> 409 Conflict (no 500)
    async add(dto: CreateProgramDto, user: User) {

        try {

            const newProgram = this.programRepository.create({ ...dto });
            return await this.programRepository.save(newProgram);

        } catch (error) {

            throw error;

        }

    }

    // TODO Reto 1: findAll(paginationDto) -> lista paginada (limit / skip)
    async findAll(pagination: PaginationDto) {

        try {

            return await this.programRepository.find({
                take: pagination.limit,
                skip: pagination.skip
            });

        } catch (error) {

            throw error;

        }

    }


    // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe
    async findById(id: string) {

        const found = await this.programRepository.findOneBy({ id });

        if (!found) {

            throw new NotFoundException;
        }

        return found;

    }

    // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
    //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
    //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
    //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
    //   Si algún id no existe: 404 y rollback.
    async assignStudents(programId: string, dto: AssignStudentsDto) {

        for (const id of dto.ids) {

            const queryRunner = this.datasource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const currentStudents = await queryRunner.manager.find(Student, { where: { program: { id: programId } } });

            const exist = currentStudents.find(

                student => student.id == id
            
            );

            const student = await this.studentRepository.preload({
                id: id
            })

            if (!student) throw new NotFoundException(`Student with id ${id} not found`);



            try {

                // 1. Traer kas notas que el estudiante tiene actualmente


                // 2. Combinar: actualizar las notas actuales y agregar las nuevas que lleguen

                for (const newGrade of grades) {




                    if (exist) {

                        exist.grade = newGrade.grade;

                    } else {

                        currentGrades.push(this.gradesRepository.create({
                            subject: newGrade.subject,
                            grade: newGrade.grade
                        }))
                    }
                }

                // 3. Guardar la lista de notas completa: no queda ninguna otra huerfana
                student.grades = currentGrades;


                await queryRunner.manager.save(student);
                await queryRunner.commitTransaction();
                await queryRunner.release();

                return this.findOne(student.id)


            } catch (error) {

                await queryRunner.rollbackTransaction();
                await queryRunner.release();

                this.handleException(error);
            }

        }

    }

    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
}
