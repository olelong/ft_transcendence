import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../auth.guard';
import ChatService from './chat.service';
import { CreateChanDto, EditChanDto, JoinChanDto } from './chat.dto';
import {
  okRes,
  CreateChanRes,
  ChannelRes,
  AllChannelsRes,
  UserChannelsRes,
} from './chat.interface';

@ApiCookieAuth()
@ApiTags('Chat')
@Controller('chat')
export default class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /* Get Channels */
  @Public()
  @Get('channels/all')
  getAllChannels(): AllChannelsRes {
    return this.chatService.getAllChannels();
  }

  @Get('channels')
  getUserChannels(): UserChannelsRes {
    return this.chatService.getUserChannels();
  }

  /* CRUD Channel */
  @Post('channels')
  createChannel(@Body() body: CreateChanDto): CreateChanRes {
    return this.chatService.createChannel(body);
  }

  @Get('channels/:id')
  getChannel(@Param('id') id: number): ChannelRes {
    return this.chatService.getChannel(id);
  }

  @Put('channels/:id')
  modifyChannel(@Param('id') id: number, @Body() body: EditChanDto): okRes {
    return this.chatService.modifyChannel(id, body);
  }

  @Delete('channels/:id')
  deleteChannel(@Param('id') id: number): okRes {
    return this.chatService.deleteChannel(id);
  }

  /* Manage users' access */
  @Post('channels/:id/join')
  joinChan(@Param('id') id: number, @Body() { password }: JoinChanDto): okRes {
    return this.chatService.joinChannel(id, password);
  }
}
