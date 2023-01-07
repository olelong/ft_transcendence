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
      ],
    };
  }
}
