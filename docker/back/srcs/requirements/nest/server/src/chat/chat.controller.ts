import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import ChatService from './chat.service';
import { CreateChanDto } from './chat.dto';
import { CreateChanRes, ChannelRes } from './chat.interface';

@ApiCookieAuth()
@ApiTags('Chat')
@Controller('chat')
export default class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /* CRUD Channel */
  @Post('channels')
  createChannel(@Body() body: CreateChanDto): CreateChanRes {
    return this.chatService.createChannel(body);
  }

  @Get('channels/:id')
  getChannel(@Param('id') id: number): ChannelRes {
    return this.chatService.getChannel(id);
  }
}
