import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import * as fs from 'fs';
import * as path from 'path';

import PrismaService from '../prisma/prisma.service';
import { CreateChanDto, EditChanDto } from './chat.dto';
import { CreateChanRes, ChannelRes, okRes } from './chat.interface';

@Injectable()
export default class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly req: Request & { userId: string },
  ) {}

  /* CRUD Channel */
  async createChannel({
    name,
    avatar,
    type,
    password,
  }: CreateChanDto): CreateChanRes {
    try {
      const owner = await this.prisma.pMMember.create({
        data: {
          userId: this.req.userId,
          role: 'OWNER',
        },
      });
      const channel = await this.prisma.pMChannel.create({
        data: {
          name,
          avatar: avatar || '/image/default.jpg',
          visible: type !== 'private',
          password: type === 'protected' ? password : null,
          members: {
            connect: [{ id: owner.id }],
          },
        },
      });
      return { chanid: channel.id };
    } catch {
      throw new NotFoundException('User not found, please login');
    }
  }

  async getChannel(id: number): ChannelRes {
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: {
        members: { select: { userId: true, role: true, time: true } },
        banned: { select: { userId: true, time: true } },
      },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    if (!channel.members.some((member) => member.userId === this.req.userId))
      throw new UnauthorizedException('You are not a member of this channel');

    // Get Channel
    const member = channel.members.find(
      (member) => member.userId === this.req.userId,
    );

    // Get owner, admins and members
    const owner = channel.members.find((member) => member.role === 'OWNER');
    const admins = channel.members
      .filter((member) => member.role === 'ADMIN')
      .map((admin) => admin.userId);
    const members = await Promise.all(
      channel.members.map(
        async (member) =>
          await this.prisma.user.findUnique({
            where: { id: member.userId },
            select: { id: true, name: true, avatar: true },
          }),
      ),
    );

    // If user is admin or owner, get muted and banned users
    type Chan = Awaited<ChannelRes>;
    let muted: Chan['muted'], banned: Chan['banned'];
    if (member.role === 'OWNER' || member.role === 'ADMIN') {
      muted = channel.members
        .filter((member) => member.role === 'MUTED')
        .map((muted) => ({
          id: muted.userId,
          time: muted.time,
        }));
      banned = await Promise.all(
        channel.banned.map(async (banned) => {
          const user = await this.prisma.user.findUnique({
            where: { id: banned.userId },
            select: { id: true, name: true, avatar: true },
          });
          return { ...user, time: banned.time };
        }),
      );
    }

    return {
      owner: owner.userId,
      admins,
      members,
      muted,
      banned,
    };
  }

  async modifyChannel(
    id: number,
    { name, avatar, type, password }: EditChanDto,
  ): okRes {
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    const member = channel.members.find(
      (member) => member.userId === this.req.userId && member.role === 'OWNER',
    );
    if (!member)
      throw new UnauthorizedException('You are not the owner of this channel');
    // Manage type & password
    if (type === 'protected' && !password)
      throw new BadRequestException(
        'You must specify a password when channel is protected',
      );
    if (password && (channel.password || type === 'protected'))
      channel.password = password;
    if (type === 'public' || type === 'protected') channel.visible = true;
    else if (type === 'private') channel.visible = false;
    // Remove old avatar
    if (avatar) {
      if (
        channel.avatar !== avatar &&
        channel.avatar !== '/image/default.jpg'
      ) {
        const imageToRemove =
          '../src/image/uploads/' + path.parse(channel.avatar).base;
        fs.unlink(path.join(__dirname, imageToRemove), (err) => {
          if (err) console.error(err);
        });
      }
    }
    // Update channel
    await this.prisma.pMChannel.update({
      where: { id },
      data: {
        name,
        avatar,
        visible: channel.visible,
        password: channel.password,
      },
    });
    return { ok: true };
  }

  async deleteChannel(id: number): okRes {
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    const member = channel.members.find(
      (member) => member.userId === this.req.userId && member.role === 'OWNER',
    );
    if (!member)
      throw new UnauthorizedException('You are not the owner of this channel');
    await this.prisma.pMChannel.delete({ where: { id } });
    return { ok: true };
  }
}
