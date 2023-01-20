import * as React from 'react';
import MockServer from "./Server/MockServer";
import { Server } from "./Server/Server";
import { Room, CommProtocols } from "./Server/common";


interface Props {
  name: string,
}


interface State {
  name: string,
  server: Server,
  rooms: Room[],
}


export class Lounge extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    var server = new MockServer(this.onMessageCallback);
    this.state = {
      name: props.name,
      server: server,
      rooms: [],
    };
    server.setUsername(props.name);
    server.requestGameList();
  }

  // Message handler for any kind of messages received from the server
  private onMessageCallback = (protocol: string, data: any) => {
    switch (protocol) {
    
      case CommProtocols.setUsername:
        this.setState({name: data as string});
        break;
      
      default:
        break;
    }
  }

  render() {
    const roomList = this.state.rooms.map(room => {
      return (
        <li key={room.creator}>
          <button disabled={room.opponent !== null}>Join</button>
          <button>Watch</button>
          <i>&nbsp;&nbsp;{room.creator}'s game</i>
        </li>
      );
    });

    const elem = (
      <div>
        <h1>Hello {this.state.name}</h1>
        <p/>
        <button
          // onClick={}
        >
          Find me somebody
        </button>
        <p/>
        <strong>List of rooms:</strong>
        <ul>
          {roomList}
        </ul>
      </div>
    );
    return elem;
  }
}
