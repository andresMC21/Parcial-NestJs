import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCampusDto } from './dto/create-campus.dto';
import { Campus } from './entities/campus.entity';
import { Student } from 'src/student/entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { AssignStudentsDto } from 'src/Common/assign-students.dto';

@Injectable()
export class CampusService {

  constructor(
    @InjectRepository(Campus)
    private readonly campusRepository: Repository<Campus>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly datasource: DataSource
  ) { }

  async create(dto: CreateCampusDto, user: User) {

    try {

      const finded = await this.campusRepository.findOne({ where: { name: dto.name } })

      if (finded) throw new ConflictException('Campus already registered')

      const newCampus = this.campusRepository.create({ ...dto, createdBy: user });
      return await this.campusRepository.save(newCampus);

    } catch (error) {

      throw error;

    }
  }

  async findById(id: string) {

    const found = await this.campusRepository.findOne({ where: { id }, relations: { students: true } });

    if (!found) {

      throw new NotFoundException;
    }

    return found;

  }

  async assignStudents(campusId: string, dto: AssignStudentsDto) {

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const campus = await queryRunner.manager.findOne(Campus, { where: { id: campusId }, relations: { students: true } });

      if (!campus) throw new NotFoundException('Program was not found')

      const currentStudents = campus?.students ?? [];

      for (const id of dto.studentIds) {

        const student = await queryRunner.manager.findOne(Student, { where: { id: id } })

        if (!student) throw new NotFoundException(`Student with id ${id} not found`);

        const exist = currentStudents.find(

          student => student.id == id

        );

        if (!exist) {

          currentStudents.push(student)

          student.campusId = campusId;

        }
      }

      if (campus.capacity < currentStudents.length) {

        throw new ConflictException('Max capacity reached')
      }

      campus.students = currentStudents;


      await queryRunner.manager.save(campus);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findById(campusId);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;

    }

  }
}
