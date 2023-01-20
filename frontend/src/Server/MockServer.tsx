import { Server } from "./Server";
import { Room, CommProtocols } from "./common";
import io from 'socket.io-client';

class MockServer implements Server {
  private socket;
  private callback;

  constructor(msgCallback: (p: string, d: any) => void) {
    this.socket = io("http://localhost:8001", { transports:["websocket"], autoConnect: false });
    this.callback = msgCallback;
    
    for (let prot in CommProtocols)
      this.socket.on(
        "s2c" + prot,
        (data) => this.callback(prot, data)
      );
  }
  
  setUsername(name: string) {
    this.socket.emit("c2s" + CommProtocols.setUsername, name);
  }

  requestGameList() {
    this.socket.emit("c2s" + CommProtocols.requestGameList);
  }

  requestUserList() {
    this.socket.emit("c2s" + CommProtocols.requestUserList);
  }
}

export default MockServer;
