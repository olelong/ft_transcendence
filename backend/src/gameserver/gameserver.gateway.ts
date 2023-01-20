import { Socket, Server } from 'socket.io';
import {
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NetProtocol, NetError, NetGame, NetUser } from './commons';
import { User, Client, GameRoom, Challenge } from './objs';


@WebSocketGateway({ cors: {origin: ["localhost:3000"]} })
export class GameServerGateway implements OnGatewayInit, OnGatewayDisconnect {
  afterInit(server: any) {
    // Test code here
    
  }

  @WebSocketServer() private server: Server;

  private users = new Map<string, User>()           // mapping of userName and user object
  private clients = new Map<string, Client>()       // mapping of clientID and client object
  private gameRooms = new Map<string, GameRoom>()   // mapping of roomID and game room object

  private challenges = new Map<string, Challenge>();  // mapping of challengeId and challenge object
  private getChallengeId = ((name1: string, name2: string) => {
    // return the unique challenge id between two user names
    let s1, s2;
    if (name1.localeCompare(name2) < 0) {
      s1 = name1; s2 = name2;
    } else {
      s1 = name2; s2 = name1;
    }
    return `${s1} ${s2}`;
  });

  
  handleDisconnect(socket: Socket) {
    const cl = this.clients.get(socket.id);
    if (!cl) return;

    const user = this.users.get(cl.userName);
    
    // Remove from clients list
    this.clients.delete(socket.id);
    
    // If watching or in a game, remove as well
    if (cl.watchingRoomId) {
      this.leaveGameRoom(cl);
    } else if (user.playingRoomId) {
      this.leaveGameRoom(cl, user.playingRoomId);
    }
    
    // Remove from users list if no client left is connected
    user.clientIds.delete(socket.id);
    if (user.clientIds.size === 0) {
      // Close all open challenges of this user
      user.openChallenges.forEach((challengeId) => {
        const challenge = this.challenges.get(challengeId);
        this.closeChallenge(challenge, user);
      });
      this.users.delete(user.name);
    }
  }

  @SubscribeMessage("debug")
  onDebug(socket: Socket, propertyName: string) {
    console.log("========= DEBUGGING " + propertyName + " =========")
    console.log(this[propertyName]);
    console.log("\n");
  }

  @SubscribeMessage(NetProtocol.setUsername)
  onSetUsername(socket: Socket, name: string): NetError | true {
    if (!name)
      return ({
        errorMsg: "Name is invalid",
        origin: {
          event: NetProtocol.setUsername,
          data: name,
        }
      });

    let user = this.users.get(name);
    if (!user){
      // First connection for this user, inform everyone in the server
      socket.broadcast.emit(NetProtocol.userOnline, name);
      // Construct new user object then add to users set
      user = {
        name: name,
        clientIds: new Set<string>(),
        openChallenges: new Set<string>(),
        playingRoomId: null
      };
      this.users.set(name, user);
    }
    user.clientIds.add(socket.id);
    this.clients.set(socket.id, {
      socket: socket,
      userName: name,
      watchingRoomId: null
    });
    return true;
  }

  @SubscribeMessage(NetProtocol.requestGameList)
  onRequestGameList(): NetGame[] {
    return Array.from(this.gameRooms.values()).map(
      (r) => {
        return ({
          id: r.id,
          name0: r.player0.name,
          name1: r.player1.name,
        });
      }
    );
  }

  @SubscribeMessage(NetProtocol.requestUserList)
  onRequestUserList(): NetUser[] {
    return Array.from(this.users.values()).map(
      (u) => {
        return ({
          name: u.name,
          playingRoomId: u.playingRoomId,
        });
      }
    );
  }

  @SubscribeMessage(NetProtocol.sendChallenge)
  onSendChallenge(socket: Socket, opponent: string): void | string | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.acceptChallenge,
        data: opponent,
      }
    });
    const cl = this.clients.get(socket.id);
    if (!cl) return;

    const user = this.users.get(cl.userName);
    const challengeId = this.getChallengeId(user.name, opponent);

    // Check if user is not challenging himself
    if (user.name === opponent)
      return error("Why do you challenge yourself? Duh.");

    // Check if opponent is valid
    const oppo = this.users.get(opponent);
    if (!oppo)
      return error(`User ${opponent} doesn't exist or isn't online`);

    // Check if user and opponent are already having an open challenge
    if (this.challenges.has(challengeId))
      return error(`A challenge between you and ${opponent} is still open`);

    // Add the challenge to user's challenge list and global list
    user.openChallenges.add(challengeId);
    oppo.openChallenges.add(challengeId);
    this.challenges.set(challengeId, {
      id: challengeId,
      timestamp: Date.now(),
      initiator: user.name,
    });
    // Send challenge to opponent
    this.sendToUser(oppo, NetProtocol.beingChallenged, user.name);
    // Simply return opponent's name if everything is ok
    return opponent;
  }
  
  @SubscribeMessage(NetProtocol.acceptChallenge)
  onAcceptChallenge(socket: Socket, challenger: string): void | string | NetError {
    const error = (msg) => ({
      errorMsg: msg,
      origin: {
        event: NetProtocol.acceptChallenge,
        data: challenger,
      }
    });
    const cl = this.clients.get(socket.id);
    if (!cl) return;
    
    const user = this.users.get(cl.userName);
    const challengeId = this.getChallengeId(user.name, challenger);
    const challenge = this.challenges.get(challengeId);
    
    // Check if there is an open challenge between two users
    if (!challenge)
      return error("Cannot go to war without first declaring war");
    
    // Check if user is not already playing
    if (user.playingRoomId)
      return error("You are already in game");

    // Check if user is not the actual challenger
    if (user.name === challenge.initiator)
      return error(`You are the challenger. Must wait for ${challenger} to accept`);
    
    // Check if challenger is not already playing
    if (this.users.get(challenger).playingRoomId)
      return error(`${challenger} is already in game`);
      
    this.closeChallenge(challenge);
    // If the client accepting the challenge is currently in a room, leave it first
    if (cl.watchingRoomId)
      this.leaveGameRoom(cl);
    const room = this.newGameRoom(challengeId);
    this.joinGameRoom(cl, room);
    }

  @SubscribeMessage(NetProtocol.closeChallenge)
  onCloseChallenge(socket: Socket, opponent: string) {
    const cl = this.clients.get(socket.id);
    if (!cl) return;
    
    const challengeId = this.getChallengeId(cl.userName, opponent);
    this.closeChallenge(this.challenges.get(challengeId));
  }


  private closeChallenge = (challenge: Challenge, ignoreUser?: User) => {
    // When an open challenge is closed, send the closeChallenge message to both
    // parties with the id of the challenge, unless ignoreUser is specified then
    // this user won't receive the message nor will be affected by the change
    if (this.challenges.delete(challenge.id)) {
      challenge.id.split(' ')
        .filter((name) => name !== ignoreUser.name)
        .forEach((name) => {
          const user = this.users.get(name);
          user.openChallenges.delete(challenge.id);
          this.sendToUser(user, NetProtocol.closeChallenge, challenge.id);
        });
    }
  }

  private newGameRoom = (challengeId: string) => {
    const names = challengeId.split(' ');
    const room: GameRoom = {
      id: challengeId,
      player0: { name: names[0], clientId: null },
      player1: { name: names[1], clientId: null },
      watchers: new Set<string>(),
    };
    this.gameRooms.set(challengeId, room);
    this.server.emit(NetProtocol.newGameRoom, {
      id: challengeId,
      name0: names[0],
      name1: names[1],
    });
    return room;
  }

  private joinGameRoom = (cl: Client, room: GameRoom) => {
    // Client join as player only if the player's name matches and no other
    // client from the same user has joined to control the player. Otherwise,
    // join as watcher
    if (cl.userName === room.player0.name && !room.player0.clientId) {
      room.player0.clientId = cl.socket.id;
    } else if (cl.userName === room.player1.name && !room.player1.clientId) {
      room.player1.clientId = cl.socket.id;
    } else {
      cl.watchingRoomId = room.id;
      room.watchers.add(cl.socket.id);
    }
    cl.socket.join(room.id);
    // TODO send room state to client
  }

  private deleteGameRoom = (room: GameRoom, message?: string) => {
    this.server.to(room.id).emit(NetProtocol.leaveGameRoom, message);
    const cl1 = this.clients.get(room.player1.clientId);
    const cl2 = this.clients.get(room.player0.clientId);
    if (cl1)
      cl1.socket.leave(room.id);
    if (cl2)
      cl2.socket.leave(room.id);
    room.watchers.forEach((id) => {
      this.clients.get(id).socket.leave(room.id);
    });
  }

  private leaveGameRoom = (cl: Client, roomId?: string) => {
    // Client leave the room. When specified, gameRoomId is the room
    // that the client is controlling a player
    const room = (roomId
                  ? this.gameRooms.get(roomId)
                  : this.gameRooms.get(cl.watchingRoomId));
    if (!room)
      return;

    if (!roomId) {
      // When leaving a room that client is currently watching
      room.watchers.delete(cl.socket.id);
      cl.socket.leave(room.id);
      cl.socket.emit(NetProtocol.leaveGameRoom);
    } else if (room.player0.name === cl.userName || room.player1.name === cl.userName) {
      // When leaving a room that client is controlling a player in game
      
      // TODO implement game logic, if game has not started, player don't lose
      // if (inGame) {
      //   cl.socket.emit(NetProtocol.leaveGameRoom, "You have lost the game for quitting");
      //   cl.socket.leave(room.id);
      // }
      this.deleteGameRoom(room, `${cl.userName} left the game`);
    }
  }

  private sendToUser = (user: User, event: string, data?: any) => {
    // Emit a message to all clients of a user
    user.clientIds.forEach((id) => {
      this.clients.get(id).socket.emit(event, data);
    })
  }
}
