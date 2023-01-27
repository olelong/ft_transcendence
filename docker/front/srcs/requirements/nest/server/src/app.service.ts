import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  firstLogin() {
    return {
      tfaRequired: false,
      token: 'gdfiofdof',
    };
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
      ],
    };
  }

  getUserInfos(): any {
    return {
      id: 'olelong',
      name: 'oridori',
      avatar:
        'https://lemeilleurpourmonlapin.fr/wp-content/uploads/2022/01/lapin-belier-nain.jpg',
      achievements: [
        {
          title: 'Win your first game',
          description: 'Win your first game',
          badge: 'https://imagizer.imageshack.com/img922/8654/bHGyzX.png',
          score: 5,
          goal: 1,
        },
        {
          title: 'Win more than 50 games',
          description: 'Win more than 50 games',
          badge: 'https://imagizer.imageshack.com/img922/654/6IWjWS.png',
          score: 5,
          goal: 50,
        },
        {
          title: 'Add a first friend',
          description: 'Add a first friend',
          badge: 'https://imagizer.imageshack.com/img923/5537/x92Vl8.png',
          score: 1,
          goal: 1,
        },
      ],
      stats: {
        wins: 5,
        loses: 2,
        rank: 100,
      },
      games: [
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
      ],
      theme: 'classic',
      tfa: false,
    };
  }

  getFriendUserInfos(): any {
    return {
      id: 'yooyoo',
      name: 'tabby s mom',
      avatar:
        'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
      achievements: [
        {
          title: 'Win your first game',
          description: 'Win your first game',
          badge: 'https://imagizer.imageshack.com/img922/8654/bHGyzX.png',
          score: 5,
          goal: 1,
        },
        {
          title: 'Win more than 50 games',
          description: 'Win more than 50 games',
          badge: 'https://imagizer.imageshack.com/img922/654/6IWjWS.png',
          score: 5,
          goal: 50,
        },
        {
          title: 'Add a first friend',
          description: 'Add a first friend',
          badge: 'https://imagizer.imageshack.com/img923/5537/x92Vl8.png',
          score: 1,
          goal: 1,
        },
      ],
      stats: {
        wins: 5,
        loses: 2,
        rank: 100,
      },
      games: [
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: '2023-01-25',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
        {
          id: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: '2023-01-20',
        },
      ],
    };
  }

  getFriendsPlaying(): any {
    return {
      users: [
        {
          id: 'ytak',
          name: 'TabbyNyooyoo',
          avatar:
            'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
          gameid: 1,
        },
        {
          id: 'whazami',
          name: 'coincoinspecteur',
          avatar:
            'https://lilalu-shop.com/media/image/fc/20/b1/lilalu-quietscheente-rubber-duck-einhorn-pink-unicorn-cake-torte.jpg',
          gameid: 2,
        },
        {
          id: 'qdam',
          name: 'tabby_Dad',
          avatar:
            'http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcSo08bPtMtiSrhiTX2-845VOe3mRXmoGvpHPXsLN5QCooa-MqTgm5jdSD-C6tlO-5BMgiptCDYLF4ea51w',
          gameid: 3,
        },
      ],
    };
  }

  putUserProfile(body): any {
    if (body.name === 'oriane') {
      return {
        name: false,
        tfa: '',
      };
    } else return { name: true, tfa: '' };
  }
}
