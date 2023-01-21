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
        'https://lemeilleurpourmonlapin.fr/wp-content/uploads/2022/01/lapin-belier-nain.jpg',
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
  
}
