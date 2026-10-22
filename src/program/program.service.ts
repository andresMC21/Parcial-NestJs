import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Program } from './entities/program.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { CreateProgramDto } from './dto/create-program.dto';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { Student } from 'src/student/entities/student.entity';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';

@Injectable()
export class ProgramService {

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
        private readonly datasource: DataSource
    ) { }

    // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
    //   - nombre o código repetido -> 409 Conflict (no 500)
    async add(dto: CreateProgramDto, user: User) {

        try {

            let finded = await this.programRepository.findOneBy({ name: dto.name });

            if (!finded) {

                finded = await this.programRepository.findOneBy({ code: dto.code });

                if (!finded) {

                    const newProgram = this.programRepository.create({ ...dto, createdBy: user });
                    return await this.programRepository.save(newProgram);

                }

            }

            throw new ConflictException('Name or code already registered')

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

        const found = await this.programRepository.findOne({ where: { id }, relations: { students: true } });

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

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            const program = await queryRunner.manager.findOne(Program, { where: { id: programId }, relations: { students: true } });

            if (!program) throw new NotFoundException('Program was not found')

            const currentStudents = program?.students ?? [];

            for (const id of dto.studentIds) {

                const student = await queryRunner.manager.findOne(Student, { where: { id: id } })

                if (!student) throw new NotFoundException(`Student with id ${id} not found`);

                const exist = currentStudents.find(

                    student => student.id == id

                );

                if (!exist) {

                    currentStudents.push(student)

                    student.programId = programId;

                }
            }

            program.students = currentStudents;

            await queryRunner.manager.save(program);
            await queryRunner.commitTransaction();
            await queryRunner.release();

            return this.findById(programId);

        } catch (error) {

            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;

        }

    }

    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
    /**async bulkCreate(programs: BulkCreateProgramDto) {

        try {

            for (const program in programs.programs) {

                const toCreate = this.programRepository.create(program)
            }


        } catch (error) {

        }

    }*/
}
