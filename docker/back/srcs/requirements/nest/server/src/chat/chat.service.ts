import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import PrismaService from '../prisma/prisma.service';
import { CreateChanDto } from './chat.dto';
import { CreateChanRes, ChannelRes } from './chat.interface';

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
      const channel = await this.prisma.pMChannel.create({
        data: {
          ownerId: this.req.userId,
          name,
          avatar,
          visible: type !== 'private',
          password: type === 'protected' ? password : null,
        },
      });
      return { chanid: channel.id };
    } catch {
      throw new NotFoundException('User not found, please login');
    }
  }

  async getChannel(id: number): ChannelRes {
    const channel = await this.prisma.pMChannel.findFirst({
      where: { id },
      include: {
        admins: { select: { id: true } },
        muted: { select: { userId: true } },
        members: { select: { id: true, name: true, avatar: true } },
        blocked: { select: { userId: true } },
      },
    });
    const admins = channel.admins.map((admin) => admin.id);
    const muted = channel.muted.map((muted) => muted.userId);
    const banned = await Promise.all(
      channel.blocked.map(
        async (block) =>
          await this.prisma.user.findFirst({
            where: { id: block.userId },
            select: { id: true, name: true, avatar: true },
          }),
      ),
    );
    return {
      owner: channel.ownerId,
      admins,
      muted,
      members: channel.members,
      banned,
    };
  }
}
