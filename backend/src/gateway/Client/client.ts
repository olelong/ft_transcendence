import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

class Client {
  constructor(private sock: Socket) {}
}

@Injectable()
export class ClientManager {}
