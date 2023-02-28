import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PMBanned, PMChannel, PMMember } from '@prisma/client';

import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

import PrismaService from '../prisma/prisma.service';
import { CreateChanDto, EditChanDto } from './chat.dto';
import {
  okRes,
  CreateChanRes,
  ChannelRes,
  AllChannelsRes,
  UserChannelsRes,
} from './chat.interface';

@Injectable()
export default class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly req: Request & { userId: string },
  ) {}

  /* Get Channels */
  async getAllChannels(): AllChannelsRes {
    const channels = (
      await this.prisma.pMChannel.findMany({
        where: { visible: true },
      })
    ).map((channel) => ({
      chanid: channel.id,
      name: channel.name,
      avatar: channel.avatar,
      protected: channel.password ? true : false,
    }));
    return { channels };
  }

  async getUserChannels(): UserChannelsRes {
    const channels = (
      await this.prisma.pMChannel.findMany({
        where: { members: { some: { userId: this.req.userId } } },
      })
    ).map((channel) => ({
      chanid: channel.id,
      name: channel.name,
      avatar: channel.avatar,
    }));
    return { channels };
  }

  /* CRUD Channel */
  async createChannel({
    name,
    avatar,
    type,
    password,
  }: CreateChanDto): CreateChanRes {
    const user = await this.prisma.user.findUnique({
      where: { id: this.req.userId },
    });
    if (!user) throw new NotFoundException('User not found, please login');
    const channel = await this.prisma.pMChannel.create({
      data: {
        name,
        avatar: avatar || '/image/default.jpg',
        visible: type !== 'private',
        password: type === 'protected' ? await bcrypt.hash(password, 10) : null,
      },
    });
    await this.prisma.pMMember.create({
      data: {
        userId: this.req.userId,
        chanId: channel.id,
        role: 'OWNER',
      },
    });
    return { chanid: channel.id };
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
      throw new ForbiddenException('You are not a member of this channel');

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
    const channel = await this.getChan(id);
    const member = channel.members.find(
      (member) => member.userId === this.req.userId && member.role === 'OWNER',
    );
    if (!member)
      throw new ForbiddenException('You are not the owner of this channel');
    // Manage type & password
    if (type === 'protected' && !password && !channel.password)
      throw new BadRequestException(
        'You must specify a password when channel is protected',
      );
    if (password && (channel.password || type === 'protected'))
      channel.password = await bcrypt.hash(password, 10);
    if (type === 'public' || type === 'private') channel.password = null;
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
    const channel = await this.getChan(id);
    const member = channel.members.find(
      (member) => member.userId === this.req.userId && member.role === 'OWNER',
    );
    if (!member)
      throw new ForbiddenException('You are not the owner of this channel');
    await this.prisma.pMMember.deleteMany({
      where: { chanId: id },
    });
    await this.prisma.pMChannel.delete({ where: { id } });
    return { ok: true };
  }

  /* Manager users' access */
  async joinChannel(id: number, password?: string): okRes {
    const channel = await this.getChan(id);
    if (channel.members.some((member) => member.userId === this.req.userId))
      throw new ConflictException('You are already a member of this channel');
    const banned = channel.banned.find(
      (banned) => banned.userId === this.req.userId,
    );
    if (banned)
      throw new ForbiddenException(
        'You are banned from this channel until ' + banned.time.toISOString(),
      );
    if (!channel.visible)
      throw new ForbiddenException('This channel is private');
    if (channel.password) {
      if (!password) throw new UnauthorizedException('Password required');
      const valid = await bcrypt.compare(password, channel.password);
      if (!valid) throw new UnauthorizedException('Invalid password');
    }
    await this.prisma.pMMember.create({
      data: { userId: this.req.userId, chanId: channel.id },
    });
    return { ok: true };
  }

  async leaveChannel(id: number, newOwnerId?: string): okRes {
    const channel = await this.getChan(id);
    const member = channel.members.find(
      (member) => member.userId === this.req.userId,
    );
    if (!member)
      throw new ConflictException('You are not a member of this channel');
    if (member.role === 'OWNER') {
      if (!newOwnerId)
        throw new BadRequestException(
          'You are the owner of this channel, you must specify the new owner',
        );
      const newOwner = channel.members.find(
        (member) => member.userId === newOwnerId,
      );
      if (!newOwner)
        throw new NotFoundException(
          newOwnerId + ' does not exist or is not a member of this channel',
        );
      await this.prisma.pMMember.update({
        where: { id: newOwner.id },
        data: { role: 'OWNER' },
      });
    }
    await this.prisma.pMMember.deleteMany({ where: { id: member.id } });
    return { ok: true };
  }

  async addUser(id: number, newMemberId: string): okRes {
    const channel = await this.getChan(id);
    if (channel.visible)
      throw new ForbiddenException('This channel is not private');
    if (!channel.members.some((member) => member.userId === this.req.userId))
      throw new ForbiddenException('You are not a member of this channel');
    const newMember = await this.prisma.user.findUnique({
      where: { id: newMemberId },
    });
    if (!newMember)
      throw new NotFoundException(newMemberId + ' does not exist');
    if (channel.members.some((member) => member.userId === newMemberId))
      throw new ConflictException(
        newMemberId + ' is already a member of this channel',
      );
    const banned = channel.banned.find(
      (banned) => banned.userId === newMemberId,
    );
    if (banned)
      throw new ForbiddenException(
        newMemberId +
          ' is banned from this channel until ' +
          banned.time.toISOString(),
      );
    await this.prisma.pMMember.create({
      data: { userId: newMemberId, chanId: channel.id },
    });
    return { ok: true };
  }

  /* UTILITY FUNCTIONS */
  private async getChan(id: number): Promise<
    PMChannel & {
      members: PMMember[];
      banned: PMBanned[];
    }
  > {
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: { members: true, banned: true },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }
}
