import { Server } from "./Server";
import { Room, CommProtocols } from "./common";
import io from 'socket.io-client';

class MockServer implements Server {
  private socket;
  private callback;

  constructor(msgCallback: (p: string, d: any) => void) {
    this.socket = io("http://localhost:8000", {transports: ['websocket']});
    this.callback = msgCallback;
    
    this.socket.on("hello", (data) => {console.log(data);})

    // for (let prot in CommProtocols)
    //   this.socket.on(
    //     prot,
    //     (data) => this.callback(prot, data)
    //   );
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
