import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../auth.guard';
import ChatService from './chat.service';
import {
  AddUserDto,
  CreateChanDto,
  EditChanDto,
  JoinChanDto,
  LeaveChanDto,
  RoleDto,
} from './chat.dto';
import {
  okRes,
  CreateChanRes,
  ChannelRes,
  AllChannelsRes,
  UserChannelsRes,
  RoleRes,
  ChannelMsgRes,
  UserMsgRes,
} from './chat.interface';

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

  @Post('channels/:id/leave')
  leaveChan(@Param('id') chanid: number, @Body() { id }: LeaveChanDto): okRes {
    return this.chatService.leaveChannel(chanid, id);
  }

  @Post('channels/:id/add')
  addUser(@Param('id') chanid: number, @Body() { id }: AddUserDto): okRes {
    return this.chatService.addUser(chanid, id);
  }

  @Post('channels/:id/role')
  changeRole(@Param('id') chid: number, @Body() { id, role }: RoleDto): okRes {
    return this.chatService.changeRole(chid, id, role);
  }

  @Get('channels/:id/role')
  getRole(@Param('id') id: number): RoleRes {
    return this.chatService.getRole(id);
  }

  /* Messages */
  @Get('channels/:id/messages')
  getChannelMessages(
    @Param('id') id: number,
    @Query('from') from: number,
    @Query('to') to: number,
  ): ChannelMsgRes {
    return this.chatService.getChannelMessages(id, from, to);
  }

  @Get('users/:id')
  getFriendMessages(
    @Param('id') id: string,
    @Query('from') from: number,
    @Query('to') to: number,
  ): UserMsgRes {
    return this.chatService.getFriendMessages(id, from, to);
  }
}
