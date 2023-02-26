import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
      const owner = await this.prisma.pMMember.create({
        data: {
          userId: this.req.userId,
          role: 'OWNER',
        },
      });
      const channel = await this.prisma.pMChannel.create({
        data: {
          name,
          avatar,
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
    // Verify if the user is a member of the channel
    const user = await this.prisma.user.findFirst({
      where: {
        AND: {
          id: this.req.userId,
          channels: { some: { chans: { some: { id: id } } } },
        },
      },
    });
    if (!user)
      throw new UnauthorizedException('You are not a member of this channel');

    // Get Channel
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: {
        members: { select: { userId: true, role: true, time: true } },
        banned: { select: { userId: true, time: true } },
      },
    });
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
}
