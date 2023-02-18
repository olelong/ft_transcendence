import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return { msg: 'Hello tabby!' };
  }

  getFriends(id, num): any {
    return {
      id: id,
      users: [
        {
          id: 'tabby',
          name: 'display tabby',
          avatar: null,
        },
        {
          id: 'whazami',
          name: 'wael',
          avatar: null,
        },
      ]
    };
  }

  getUserInfos(): any {
    return {
      id: 'olelong',
      avatar:
        'image/tabby2.jpg',
    };
  }
  
  getFriendsPlaying() :any {
    return {
      users: [
        {
          id: 'ytak',
          name: 'TabbyNyooyoo',
          avatar:'https://media.discordapp.net/attachments/821737181159751740/1066392670014013571/IMG_7195.JPG?width=575&height=767',
          gameid: 1,
        },
        {
          id: 'whazami',
          name: 'coincoinspecteur',
          avatar:'https://lilalu-shop.com/media/image/fc/20/b1/lilalu-quietscheente-rubber-duck-einhorn-pink-unicorn-cake-torte.jpg',
          gameid: 2,
        },
        {
          id: 'qdam',
          name: 'tabby_Dad',
          avatar:'http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcSo08bPtMtiSrhiTX2-845VOe3mRXmoGvpHPXsLN5QCooa-MqTgm5jdSD-C6tlO-5BMgiptCDYLF4ea51w',
          gameid: 3,
        },

      ]
    }
  }
  getLeaderBoard(): any {
    return {
      users: [
        {
          id:'tabby',
          name: 'Tak tabby',
          avatar: "https://media.discordapp.net/attachments/821737181159751740/1066392670014013571/IMG_7195.JPG?width=575&height=767",
          score: 10,
        },
        {
          id: 'tabby mom',
          name: 'chat',
          avatar: "https://cdn.pixabay.com/photo/2021/10/26/16/10/cat-6744439_960_720.jpg",
          score:3,
        },
        {
          id: 'tabby dad',
          name: 'daddy',
          avatar: "http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcSo08bPtMtiSrhiTX2-845VOe3mRXmoGvpHPXsLN5QCooa-MqTgm5jdSD-C6tlO-5BMgiptCDYLF4ea51w",
          score: 1,
        },
      ]
    }
  }

  getGameInfos(): any {
    return {
      users: [
        {
          id: 'tabbyCochon',
          name: 'Tabby',
          avatar: "https://media.discordapp.net/attachments/821737181159751740/1066392670014013571/IMG_7195.JPG?width=575&height=767",
          gameid: 1,
        },
        {
          id: 'tabbylover',
          name: 'tabbyEnemy',
          avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdKYe00NaD5SQjIMvXYPssq0r1dXJggL3ZIg&usqp=CAU",
          gameid: 12,
        },
      ]
    }
  }
  
}
