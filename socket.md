# Socket events

## Authentication

Each socket connection must be accompanied by a valid authentication token. So if no token is provided or the token is invalid, the connection will be rejected with the associated error message.<br>
Note that the token must be stored in the browser's cookies.

## Error Handling

Each error, no matter from what event, is sent through the "error" event and respect this structure:
```js
{
    errorMsg: String | String[],
    origin: {
        event: String,
        data: Object
    }
}
```

## Game

Connection
```js
socket.io
namespace: "game"
```

### Send to Server

Update player's paddle position
```js
/* EVENT */
"update"
{
    paddlePos: Number
}
/* ACK */
true
```

### Receive from Server

Informations about the game (received at connection)
```js
/* EVENT */
"init"
{
    config: {
        canvas: {
            width: Number,
            height: Number
        },
        paddle: {
            width: Number,
            height: Number
        },
        ballRadius: Number
    },
    players: [String, String],
    state: typeof "update" event (see below),
    idx?: Number // if client is player
}
```

Current game state (received each time it changes)
```js
/* EVENT */
"update"
{
    paddles: [Number, Number],
    ball: {
        x: Number,
        y: Number
    },
    scores: [Number, Number],
    pauseMsg?: String, // appears if game is paused
    started: Boolean,
    ended: Boolean,
    watchers: Number
}
```

## Chat

Connection
```js
socket.io
namespace: "chat"
```

### Send to Server

#### Game related events

Deal with challenges
```js
/* EVENT */
"challenge"
{
    action: String, // can be 'send', 'accept' or 'close'
    opponentName: String
}
/* ACK */
true
```

Enter/leave game room
```js
/* EVENT */
"game-room"
{
    join: Boolean,
    roomId?: String // if join is true
}
/* ACK */
true
```

Ask for/cancel matchmaking
```js
/* EVENT */
"matchmaking"
{
    join: Boolean
}
/* ACK */
true
```

#### Messages

Send message to channel
```js
/* EVENT */
"message:channel"
{
    id: Number, // channel's id
    content: String, // message's content
}
/* ACK */
true
```

Send message to user
```js
/* EVENT */
"message:user"
{
    id: String, // user's id
    content: String, // message's content
}
/* ACK */
true
```

#### User infos

Get status of users
```js
/* EVENT */
"user:status"
{
    users: String[] // users ids
}
/* ACK */
{
    users: [
        {
            id: String,
            status: String // can be 'ingame', 'online' or 'offline'
        },
        {
            id: String,
            status: String // can be 'ingame', 'online' or 'offline'
        },
        ...
    ]
}
```

Mute/kick/ban user (user sending one of these events must be admin)
```js
/* EVENT */
"user:sanction"
{
    id: Number, // channel's id
    userid: String, // the id of the user to mute/kick/ban
    type: String, // can be 'mute', 'kick' or 'ban'
    add: Boolean, // true to mute/kick/ban, false to unmute/unban
    time?: Date // only needed for mute and ban (future time) (if not set, definitive)
}
/* ACK */
true
```

### Receive from Server

#### Game related events

New challenge update
```js
/* EVENT */
"challenge"
{
    info: String, // can be 'new', 'accepted' or 'closed'
    opponentName: String,
    gameId?: String // for 'accepted' case
}
```

Matchmaking: opponent found
```js
/* EVENT */
"matchmaking"
{
    opponentName: String,
    gameId: String
}
```

#### Messages

New channel's message
```js
/* EVENT */
"message:channel"
{
    id: Number, // channel's id
    msgid: Number,
    sender: {
        id: String,	// 42 login
        name: String,	// Display name
        avatar: String	// URL to avatar
    },
    content: String	// message's content
}
```

New user's message
```js
/* EVENT */
"message:user"
{
    id: String, // user's id
    msgid: Number,
    senderid: String,	// 42 login
    content: String	// message's content
}
```

#### User infos

You have been muted/kicked/banned from a channel!
```js
"user:sanction"
{
    id: Number, // channel's id
    type: String, // can be 'mute', 'kick' or 'ban'
    time?: Date // only for mute and ban (future time)
}
```
