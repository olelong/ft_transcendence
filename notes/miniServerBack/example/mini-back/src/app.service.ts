import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(body): any {
    return { id: body.id, name: 'tabby', avatar: 'ici/la' };
  }
}
