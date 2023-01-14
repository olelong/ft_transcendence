import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return { msg: 'Hello tabby' };
  }

  getUserInfos(): any {
    return {
      id: 'olelong',
      avatar:
        'https://lemeilleurpourmonlapin.fr/wp-content/uploads/2022/01/lapin-belier-nain.jpg',
    };
  }
}
