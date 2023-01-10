import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.users();
  }

  @Post()
  updateUser(@Body() { name }: { name: string }) {
    this.userService.create(name);
  }
}
