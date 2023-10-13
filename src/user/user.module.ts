import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import UserEventLog from 'src/user.event.log/entities/user.event.log.entity';
import { UserEventLogService } from 'src/user.event.log/user.event.log.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserEventLog])],
  exports: [TypeOrmModule],
  controllers: [UserController],
  providers: [UserService, UserEventLogService],
})
export class UserModule {}
