import { Module } from '@nestjs/common';
import { CampusService } from './campus.service';
import { CampusController } from './campus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campus } from './entities/campus.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [CampusController],
  imports: [
    TypeOrmModule.forFeature([Campus]),
    UserModule
  ],
  providers: [CampusService],
})
export class CampusModule { }
