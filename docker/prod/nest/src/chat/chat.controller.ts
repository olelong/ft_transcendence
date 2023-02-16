import { Controller, Get } from '@nestjs/common';
import ChatService from './chat.service';

@Controller('chat')
export default class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  test(): string {
    return this.chatService.sayHello();
  }
}