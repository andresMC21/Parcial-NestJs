import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ProgramService } from './program.service';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { CreateProgramDto } from './dto/create-program.dto';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/student/dto/pagination.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) { }

  // TODO Reto 1: POST   /api/program               -> crear programa
  @Post()
  @Auth(ValidRoles.admin)
  async create(@Body() dto: CreateProgramDto, @GetUser() user: User) {

    return this.programService.add(dto, user);

  }

  // TODO Reto 1: GET    /api/program               -> listar (paginado con PaginationDto)
  @Get()
  async searchAll(@Query() pagination: PaginationDto) {

    return this.programService.findAll(pagination);
  }

  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  @Get(':id')
  async searchById(@Param('id', ParseUUIDPipe) id: string) {

    return this.programService.findById(id);

  }

  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  @Patch(':id/students')
  @Auth(ValidRoles.admin)
  async assignStudents(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignStudentsDto) {

    return this.programService.assignStudents(id, dto);

  }

  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  @Post('bulk')
  @Auth(ValidRoles.admin)
  async bulkPrograms(@Body() programs: BulkCreateProgramDto, @GetUser() user: User) {

    return this.programService.bulkCreate(programs, user);

  }

  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos
}
