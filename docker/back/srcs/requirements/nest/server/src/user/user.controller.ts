import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): PrismaPromise<User[]> {
    return this.userService.users();
  }

  @Post()
  updateUser(@Body() { name }: { name: string }): void {
    void this.userService.create(name);
  }
}
