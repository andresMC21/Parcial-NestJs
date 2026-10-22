import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AssignStudentsDto } from 'src/Common/assign-students.dto';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) { }

  @Post()
  @Auth(ValidRoles.admin)
  async create(@Body() createCampusDto: CreateCampusDto, @GetUser() user: User) {

    return this.campusService.create(createCampusDto, user);

  }

  @Get(':id')
  async seacrhById(@Param('id', ParseUUIDPipe) id: string) {
    return this.campusService.findById(id);
  }

  @Patch(':id/students')
  @Auth(ValidRoles.admin)
  async assignStudents(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignStudentsDto) {
    return this.campusService.assignStudents(id, dto);
  }
}
