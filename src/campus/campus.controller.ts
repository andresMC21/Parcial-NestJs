import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampusService } from './campus.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) { }

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createCampusDto: CreateCampusDto, @GetUser() user: User) {

    return this.campusService.create(createCampusDto, user);

  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampusDto: UpdateCampusDto) {
    return this.campusService.update(+id, updateCampusDto);
  }
}
