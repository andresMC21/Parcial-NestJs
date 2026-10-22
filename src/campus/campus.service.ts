import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Campus } from './entities/campus.entity';
import { Student } from 'src/student/entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

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
}
