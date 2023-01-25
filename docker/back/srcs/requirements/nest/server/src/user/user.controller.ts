import { Body, Controller, Get, Post } from '@nestjs/common';
import { User, PrismaPromise } from '@prisma/client';

import UserService from './user.service';
import { LoginDto } from './user.dto';
import { LoginRes } from './user.interface';

@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  firstLogin(@Body() { id }: LoginDto): LoginRes {
    return this.userService.firstLogin(id);
  }

  /* DEBUG ROUTES */
  @Get()
  users(): PrismaPromise<User[]> {
    return this.userService.users();
  }
}
