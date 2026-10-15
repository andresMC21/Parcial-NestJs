import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProgramService } from './program.service';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { CreateProgramDto } from './dto/create-program.dto';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/student/dto/pagination.dto';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }

  // TODO Reto 1: POST   /api/program               -> crear programa
  @Post()
  @Auth(ValidRoles.admin)
  async create(dto: CreateProgramDto, @GetUser() user: User) {

    return await this.programService.add(dto, user);

  }

  // TODO Reto 1: GET    /api/program               -> listar (paginado con PaginationDto)
  @Get()
  @Auth()
  async searchAll(@Query() pagination: PaginationDto) {

    return await this.programService.findAll(pagination);
  }

  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
