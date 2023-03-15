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
      avatar: '/image/1675283156141_lapin.jpg',
      achievements: [
        {
          name: "Beginner's luck?",
          desc: 'Win 1 game',
          img: '/image/1677795968806_winBadge.PNG',
          score: 5,
          goal: 1,
        },
        {
          name: 'Much to learn you still have',
          desc: 'Win 15 games',
          img: '/image/1677795968806_winBadge.PNG',
          score: 5,
          goal: 10,
        },
        {
          name: 'Pong master',
          desc: 'Win 50 games',
          img: '/image/1677795928155_loseBadge.png',
          score: 5,
          goal: 50,
        },
        {
          name: 'You’re not alone anymore!!',
          desc: 'Add 1 friend',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 1,
        },
        {
          name: 'Now you’re getting popular.',
          desc: 'Add 5 friends',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 10,
        },
        {
          name: 'A star is born B)',
          desc: 'Add 15 friends',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 50,
        },
        {
          name: 'Are you awake?',
          desc: '3 games losses',
          img: '/image/1677795890761_friendBadge.png',
          score: 2,
          goal: 3,
        },
        {
          name: 'Socialize yourself ( •̀ᴗ•́ )و ̑̑',
          desc: 'Create a channel group',
          img: '/image/1677795890761_friendBadge.png',
          score: 2,
          goal: 3,
        },
        {
          name: 'You are writing the Pong history',
          desc: 'Become rank 1',
          img: '/image/1677795890761_friendBadge.png',
          score: 0,
          goal: 1,
        },
        {
          name: "Mommy I'm on TV!",
          desc: 'Be in the top 3',
          img: '/image/1677795890761_friendBadge.png',
          score: 0,
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
          name: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: new Date('2023-02-28T00:19:24.329Z'),
        },
        {
          name: 'whazami',
          myScore: 10,
          enemyScore: 2,
          timestamp: new Date('2023-02-28T01:19:24.329Z'),
        },
        {
          name: 'whazami',
          myScore: 15,
          enemyScore: 2,
          timestamp: new Date('2023-02-28T00:19:14.329Z'),
        },
        {
          name: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(),
        },
      ],
      theme: 'galactic',
      tfa: false,
    };
  }

  getFriendUserInfos(): any {
    return {
      id: 'yooyoo',
      name: 'tabbysmom',
      avatar: '/image/1675284014480_cat.jpeg',
      achievements: [
        {
          name: "Beginner's luck?",
          desc: 'Win 5 games',
          img: '/image/1677795968806_winBadge.PNG',
          score: 5,
          goal: 1,
        },
        {
          name: 'Much to learn you still have',
          desc: 'Win 15 games',
          img: '/image/1677795968806_winBadge.PNG',
          score: 10,
          goal: 15,
        },
        {
          name: 'Are you awake?',
          desc: '3 games losses',
          img: '/image/1677795890761_friendBadge.png',
          score: 2,
          goal: 3,
        },
        {
          name: 'Pong master',
          desc: 'Win 50 games',
          img: '/image/1677795928155_loseBadge.png',
          score: 5,
          goal: 50,
        },
        {
          name: 'You’re not alone anymore!!',
          desc: 'Add 1 friend',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 1,
        },
        {
          name: 'Now you’re getting popular.',
          desc: 'Add 5 friends',
          img: '/image/1677795890761_friendBadge.png',
          score: 5,
          goal: 5,
        },
        {
          name: 'You are writing the Pong history',
          desc: 'Become rank 1',
          img: '/image/1677795890761_friendBadge.png',
          score: 0,
          goal: 1,
        },
        {
          name: 'A star is born B)',
          desc: 'Add 15 friends',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 15,
        },

        {
          name: 'Socialize yourself ( •̀ᴗ•́ )و ̑̑',
          desc: 'Create a channel group',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 1,
        },
        {
          name: "Mommy I'm on TV!",
          desc: 'Be in the top 3',
          img: '/image/1677795890761_friendBadge.png',
          score: 0,
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
          name: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(2022022),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(2022022),
        },
        {
          name: 'whazami',
          myScore: 20,
          enemyScore: 2,
          timestamp: new Date(),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(2022022),
        },
        {
          name: 'whazami',
          myScore: 14,
          enemyScore: 20,
          timestamp: new Date(2022022),
        },
      ],
    };
  }

  getOtherFriendUserInfos(): any {
    return {
      id: 'whazami',
      name: 'AgentCroquette',
      avatar: '/image/1676805018700_canard.jpg',
      achievements: [
        {
          name: "Beginner's luck?",
          desc: 'Win 1 game',
          img: '/image/1677795968806_winBadge.PNG',
          score: 5,
          goal: 1,
        },
        {
          name: 'Much to learn you still have',
          desc: 'Win 15 games',
          img: '/image/1677795968806_winBadge.PNG',
          score: 5,
          goal: 10,
        },
        {
          name: 'Pong master',
          desc: 'Win 50 games',
          img: '/image/1677795928155_loseBadge.png',
          score: 5,
          goal: 50,
        },
        {
          name: 'You’re not alone anymore!!',
          desc: 'Add 1 friend',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 1,
        },
        {
          name: 'Now you’re getting popular.',
          desc: 'Add 5 friends',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 10,
        },
        {
          name: 'A star is born B)',
          desc: 'Add 15 friends',
          img: '/image/1677795890761_friendBadge.png',
          score: 1,
          goal: 50,
        },
        {
          name: 'Are you awake?',
          desc: '3 games losses',
          img: '/image/1677795890761_friendBadge.png',
          score: 2,
          goal: 3,
        },
        {
          name: 'Socialize yourself ( •̀ᴗ•́ )و ̑̑',
          desc: 'Create a channel group',
          img: '/image/1677795890761_friendBadge.png',
          score: 2,
          goal: 3,
        },
        {
          name: 'You are writing the Pong history',
          desc: 'Become rank 1',
          img: '/image/1677795890761_friendBadge.png',
          score: 0,
          goal: 1,
        },
        {
          name: "Mommy I'm on TV!",
          desc: 'Be in the top 3',
          img: '/image/1677795890761_friendBadge.png',
          score: 0,
          goal: 1,
        },
      ],
      stats: {
        wins: 0,
        loses: 0,
        rank: 0,
      },
      games: [],
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
    if (body.theme) {
      return {
        ok: true,
      };
    }
    if (body.tfa === true)
      return {
        tfa: 'https://www.lyon-entreprises.com/wp-content/uploads/la-societe-lyonnaise-qrmobile-lance-le-qrcode-dans-tout-lhexagone.jpg',
      };
    else if (body.tfa === false)
      return {
        ok: true,
      };
    if (body.name === 'oriane') {
      return {
        name: false,
        tfa: '',
      };
    } else return { name: true, tfa: '' };
  }

  getBlockedUserList() {
    return {
      users: [
        {
          id: 'whazami',
          name: 'AgentCroquette',
          avatar: '/image/1676805018700_canard.jpg',
        },
        {
          id: 'yooyoo',
          name: 'tabbysmom',
          avatar: '/image/1675284014480_cat.jpeg',
        },
      ],
    };
  }

  getFriendList() {
    return {
      friends: [
        {
          id: 'whazami',
          name: 'AgentCroquette',
          avatar: '/image/1676805018700_canard.jpg',
        },
      ],
      pending: [
        {
          id: 'yooyoo',
          name: 'tabbysmom',
          avatar: '/image/1675284014480_cat.jpeg',
        },
      ],
    };
  }
}
