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
import {
  DMMessage,
  PMBanned,
  PMChannel,
  PMMember,
  PMMessage,
  Prisma,
  Role,
} from '@prisma/client';

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
  RoleRes,
  ChannelMsgRes,
  UserMsgRes,
} from './chat.interface';
import achievements from '../achievements';

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
        include: { members: true },
      })
    )
      .sort((a, b) => b.members.length - a.members.length)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        avatar: channel.avatar,
        protected: channel.password ? true : false,
      }));
    return { channels };
  }

  async getUserChannels(): UserChannelsRes {
    const channels = (
      await Promise.all(
        (
          await this.prisma.pMChannel.findMany({
            where: { members: { some: { userId: this.req.userId } } },
          })
        ).map(
          async (chan) =>
            [
              (await this.getMessages(chan.id, 0, 1))[0]?.time.getTime(),
              chan,
            ] as [number, PMChannel],
        ),
      )
    )
      .sort((a, b) => {
        if (!a[0] || !b[0]) return 0;
        return b[0] - a[0];
      })
      .map((x) => x[1])
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        avatar: channel.avatar,
        private: !channel.visible,
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
    // Update achievement
    await this.prisma.achievement.update({
      where: { desc: achievements.createChannel.descs[0] },
      data: {
        users: { connect: { id: this.req.userId } },
      },
    });
    return { id: channel.id };
  }

  async getChannel(id: number): ChannelRes {
    if (Number.isNaN(id))
      throw new BadRequestException("channel's id must be a number");
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: {
        members: { select: { userId: true, role: true, time: true } },
        banned: { select: { userId: true, time: true } },
      },
    });
    if (!channel) throw new NotFoundException('Channel does not exist');
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
        const imageToRemove = path.join(
          process.cwd(),
          'src/image/uploads',
          path.parse(channel.avatar).base,
        );
        fs.unlink(imageToRemove, (err) => {
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
    await this.prisma.pMBanned.deleteMany({
      where: { chanId: id },
    });
    await this.prisma.pMMessage.deleteMany({
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
        'You are banned from this channel' +
          (banned.time ? ' until ' + banned.time.toISOString() : ''),
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
      if (newOwnerId === this.req.userId)
        throw new ConflictException('The new owner can not be yourself');
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
    await this.prisma.pMMember.delete({ where: { id: member.id } });
    return { ok: true };
  }

  async addUser(chanid: number, newMemberId: string): okRes {
    const channel = await this.getChan(chanid);
    if (channel.visible)
      throw new ForbiddenException('This channel is not private');
    if (!channel.members.some((member) => member.userId === this.req.userId))
      throw new ForbiddenException('You are not a member of this channel');
    const newMember = await this.prisma.user.findUnique({
      where: { id: newMemberId },
    });
    if (!newMember)
      throw new NotFoundException(newMemberId + ' does not exist');
    if (newMemberId === this.req.userId)
      throw new ConflictException('You are trying to add yourself? ಠಿ_ಠ');
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
          ' is banned from this channel' +
          (banned.time ? ' until ' + banned.time.toISOString() : ''),
      );
    await this.prisma.pMMember.create({
      data: { userId: newMemberId, chanId: channel.id },
    });
    return { ok: true };
  }

  async changeRole(chanid: number, userId: string, role: string): okRes {
    const channel = await this.getChan(chanid);
    const member = channel.members.find(
      (member) => member.userId === this.req.userId,
    );
    if (!member || member.role !== 'OWNER')
      throw new ForbiddenException('You are not the owner of this channel');
    const memberNewRole = channel.members.find(
      (member) => member.userId === userId,
    );
    if (!memberNewRole)
      throw new ForbiddenException(userId + ' is not a member of this channel');
    if (userId === this.req.userId)
      throw new ConflictException('You can not change your own role');
    if (role === 'owner')
      await this.prisma.pMMember.update({
        where: { id: member.id },
        data: { role: 'ADMIN' },
      });
    await this.prisma.pMMember.update({
      where: { id: memberNewRole.id },
      data: { role: role.toUpperCase() as Role },
    });
    return { ok: true };
  }

  async getRole(chanid: number): RoleRes {
    const channel = await this.getChan(chanid);
    const member = channel.members.find(
      (member) => member.userId === this.req.userId,
    );
    const banned = channel.banned.find(
      (member) => member.userId === this.req.userId,
    );
    if (!member && !banned)
      throw new ConflictException('You have no affiliation with this channel');
    if (banned) return { role: 'banned', time: banned.time || undefined };
    else
      return {
        role: member.role.toLowerCase(),
        time: member.time || undefined,
      };
  }

  /* Messages */
  async getChannelMessages(
    chanid: number,
    from: number,
    to: number,
  ): ChannelMsgRes {
    const channel = await this.getChan(chanid);
    if (!channel.members.some((member) => member.userId === this.req.userId))
      throw new ForbiddenException('You are not a member of this channel');
    const user = await this.prisma.user.findUnique({
      where: { id: this.req.userId },
      include: { blocked: true, blockedBy: true },
    });
    const blocked = [
      ...new Set([
        ...user.blocked.map((b) => b.id),
        ...user.blockedBy.map((b) => b.id),
      ]),
    ];
    const messages = await Promise.all(
      (
        await this.getMessages(chanid, from, to, { excludeMembers: blocked })
      ).map(async (msg) => {
        const sender = await this.prisma.user.findUnique({
          where: { id: msg.senderId },
          select: { id: true, name: true, avatar: true },
        });
        return {
          id: msg.id,
          sender,
          content: msg.content,
          time: msg.time,
        };
      }),
    );
    return { messages };
  }

  async getFriendMessages(
    friendid: string,
    from: number,
    to: number,
  ): UserMsgRes {
    if (friendid === this.req.userId)
      throw new ForbiddenException('You can not chat with yourself');
    const friend = await this.prisma.user.findFirst({
      where: {
        AND: [
          { id: friendid },
          { friends: { some: { id: this.req.userId } } },
          { friendOf: { some: { id: this.req.userId } } },
        ],
      },
    });
    if (!friend)
      throw new ConflictException('You are not friend with ' + friendid);
    const users = [this.req.userId, friendid].sort();
    const dmChannel = await this.prisma.dMChannel.findFirst({
      where: { AND: [{ userId1: users[0] }, { userId2: users[1] }] },
    });
    if (!dmChannel) return { messages: [] };
    const messages = (
      await this.getMessages(dmChannel.id, from, to, { isDm: true })
    ).map((msg) => ({
      id: msg.id,
      senderid: msg.senderId,
      content: msg.content,
      time: msg.time,
    }));
    return { messages };
  }

  /* UTILITY FUNCTIONS */
  private async getChan(id: number): Promise<
    PMChannel & {
      members: PMMember[];
      banned: PMBanned[];
    }
  > {
    if (Number.isNaN(id))
      throw new BadRequestException("channel's id must be a number");
    const channel = await this.prisma.pMChannel.findUnique({
      where: { id },
      include: { members: true, banned: true },
    });
    if (!channel) throw new NotFoundException('Channel does not exist');
    return channel;
  }

  private async getMessages(
    chanId: number,
    from: number,
    to: number,
    { isDm = false, excludeMembers = [] } = {},
  ): Promise<PMMessage[] | DMMessage[]> {
    if (Number.isNaN(from) || Number.isNaN(to) || from < 0 || to < 0)
      throw new BadRequestException("'from' and 'to' must be positive numbers");
    if (from >= to)
      throw new BadRequestException("'to' must be greater than 'from'");
    const query = {
      where: {
        AND: [{ chanId }, { NOT: { senderId: { in: excludeMembers } } }],
      },
      skip: from,
      take: to - from,
      orderBy: { time: 'desc' },
    } as Prisma.PMMessageFindManyArgs | Prisma.DMMessageFindManyArgs;
    let messages: PMMessage[] | DMMessage[] =
      await this.prisma.pMMessage.findMany(query);
    if (isDm) messages = await this.prisma.dMMessage.findMany(query);
    return messages;
  }
}
