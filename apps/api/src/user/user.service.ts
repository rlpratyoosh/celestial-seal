import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import validateOrThrow from 'src/common/helper/zod-validation.helper';
import { CreateUserSchema } from './schemas/create-user.schema';
import type { UserEntity } from './entities/user.entity';
import { UpdateUserSchema } from './schemas/update-user.schema';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const data = validateOrThrow(CreateUserSchema, createUserDto);
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002')
        throw new BadRequestException('Username is already taken!');
      // console.log(error) // For Debugging
      throw new InternalServerErrorException('Unknown error occured!');
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Unknown error occured!');
    }
  }

  async findOne(id: string) {
    let user: UserEntity | null = null;
    try {
      user = await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      // console.log(error) // For Debugging
      throw new InternalServerErrorException('Unknown error occured!');
    }
    if (!user) throw new NotFoundException('User not found!');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data = validateOrThrow(UpdateUserSchema, updateUserDto);
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('User not found!');
      if (error.code === 'P2002')
        throw new BadRequestException('Username already taken!');
      // console.log(error) // For Debugging
      throw new InternalServerErrorException('Unknown error occured!');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundException('User not found!');
      // console.log(error) // For Debugging
      throw new InternalServerErrorException('Unknown error occured!');
    }
  }
}
