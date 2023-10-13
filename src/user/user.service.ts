import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserEventLogService } from 'src/user.event.log/user.event.log.service';
import * as bcrypt from 'bcrypt';
import { Method } from 'src/user.event.log/entities/user.event.log.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private usersEventLogService: UserEventLogService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      if (
        createUserDto.username.length < 3 ||
        createUserDto.username.length > 50
      )
        throw new HttpException(
          'username must have from 3 to 50 characters',
          HttpStatus.BAD_REQUEST,
        );

      if (
        createUserDto.password.length < 3 ||
        createUserDto.password.length > 50
      )
        throw new HttpException(
          'password must have from 3 to 50 characters',
          HttpStatus.BAD_REQUEST,
        );

      const hashed_password = await bcrypt.hash(createUserDto.password, 10);

      const exist_user = await this.usersRepository.findOneBy({
        username: createUserDto.username,
      });

      if (exist_user)
        throw new HttpException(
          'such username already exist',
          HttpStatus.BAD_REQUEST,
        );

      const current_date = new Date();

      const user = this.usersRepository.create({
        username: createUserDto.username,
        password: hashed_password,
        updated_at: current_date,
        created_at: current_date,
      });

      await this.usersRepository.save(user).then(async (user) => {
        await this.usersEventLogService.create({
          userId: user.id,
          method: Method.POST,
          old_data: null,
          new_data: null,
          comment: 'user created',
        });
      });
      return user;
    } catch (error) {
      throw new HttpException(error.response, error.statusCode);
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      throw new HttpException(error.response, error.statusCode);
    }
  }

  async findOne(id: string) {
    try {
      return await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new HttpException(error.response, error.statusCode);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const exist_user = await this.usersRepository.findOneBy({
        id: id,
      });

      if (!exist_user)
        throw new HttpException(
          'such username not found',
          HttpStatus.BAD_REQUEST,
        );

      const current_date = new Date();

      if (updateUserDto.password) {
        if (
          updateUserDto.password.length < 3 ||
          updateUserDto.password.length > 50
        )
          throw new HttpException(
            'password must have from 3 to 50 characters',
            HttpStatus.BAD_REQUEST,
          );

        const password = updateUserDto.password;
        const hashed_password = await bcrypt.hash(password, 10);

        const updated_user = await this.usersRepository
          .update(
            { id },
            { password: hashed_password, updated_at: current_date },
          )
          .then(async () => {
            await this.usersEventLogService.create({
              userId: id,
              method: Method.PATCH,
              old_data: exist_user.password,
              new_data: hashed_password,
              comment: 'user password updated',
            });
          });
      }

      if (updateUserDto.username) {
        if (
          updateUserDto.username.length < 3 ||
          updateUserDto.username.length > 50
        )
          throw new HttpException(
            'username must have from 3 to 50 characters',
            HttpStatus.BAD_REQUEST,
          );

        const username = updateUserDto.username;

        const updated_user = await this.usersRepository
          .update({ id }, { username: username, updated_at: current_date })
          .then(async () => {
            await this.usersEventLogService.create({
              userId: id,
              method: Method.PATCH,
              old_data: updateUserDto.username,
              new_data: username,
              comment: 'user username updated',
            });
          });
      }

      return await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new HttpException(error.response, error.statusCode);
    }
  }
}
