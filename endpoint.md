# Communication Endpoints

## Authentication

Each request with the icon <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" /> must be accompanied by a valid authentication token. So if no token is provided or the token is invalid, the request will be rejected with a 401 Unauthorized response.<br>
Note that the token must be stored in the browser's cookies.

## User account

### Login

This request is sent after the 42 API has validated user's credential, no matter whether the user has been registered or not.
```js
/* REQUEST */
POST /user/login
{
	id: String,	// 42 login
	tfa: String	// the Google Auth 6-digit token (can be empty)
}
/* RESPONSE */
{
	id: String,
	token: String
}
```

### Profile

Get some user's attributes from their profile <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /user/profile[/:id]

/* RESPONSE */
{
	id: String,
	name: String,	// display name
	avatar: String,	// absolute URL to user's avatar
	achievements: [
		{
			title: String,
			description: String,
			badge: String,	// absolute URL to badge's image
			score: Number,
			goal: Number
		},
		{
			title: String,
			description: String,
			badge: String,	// absolute URL to badge's image
			score: Number,
			goal: Number
		},
		...
	],
	stats: {
		winRate: Number,
		rank: Number
	},
	theme: String,	// only if it's user's profile
	tfa: Boolean	// only if it's user's profile
}
```

Make changes to profile <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
PUT /user/profile
{
	name: String,	// display name, if empty default to 42 login
	avatar: String,	// absolute URL to user's avatar, if empty set to default URL
	theme: String,
	tfa: Boolean	// enable or disable 2-factor auth
}
/* RESPONSE */
{
	id: String,
	name: Boolean,	// display name is OK (unique
	avatar: Boolean,// always true, back-end won't check URL validity
	tfa: String	// URL to QR code if tfa turned from false to true, else empty
}
```

Google 2FA validation <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /user/profile/tfavalidation
{
	code: String	// 2FA code coming from user's phone
}
/* RESPONSE */
{
	id: String,
	valid: Boolean
}
```

Get friend/blocked list <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /user/friends[?num=num]
GET /user/blocks[?num=num]
{
	num: Number // Max number of friends/blocked in response, 0 or none to get everyone
}
/* RESPONSE */
{
	id: String,
	users: [    // Array of user objects
		{
			id: String,
			name: String,	// display name
			avatar: String	// absolute URL to user's avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String	// absolute URL to user's avatar
		},
		...
	]
}
```

Check if user is friend with / blocked another user <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /user/friends/:id
GET /user/blocks/:id

/* RESPONSE */
{
	id1: String,	// me
	id2: String,	// other user
	res: Boolean	// is id1 and id2 are friend/blocked
}
```

Add/remove friend/blocked <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /user/friends/:id
POST /user/blocks/:id
{
	add: Boolean	// true if adding, false if removing
}
/* RESPONSE */
{
	id1: String,	// me
	id2: String,	// other user
	res: Boolean	// true if successful (state changed)
}
```

## Game

Get all friends currently playing <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /game/friendsplaying

/* RESPONSE */
{
	id: String,
	users: [    // Array of user objects
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
			gameid: Number	// id of game playing
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
			gameid: Number	// id of game playing
		},
		...
	]
}
```

Get leaderboard
```js
/* REQUEST */
GET /game/leaderboard

/* RESPONSE */
{
	users: [  // Array of user objects
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
			score: Number	// calculated score
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
			score: Number	// calculated score
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
			score: Number	// calculated score
		}
	]
}
```

Matchmaking <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* URL */
GET /game/matchmaking
```

Get my game <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* URL */
GET /game
```

Watch a game <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* URL */
GET /game/watch/:id
```

## Chat

### Channels

Get all public channels
```js
/* REQUEST */
GET /chat/channels/all

/* RESPONSE */
{
	channels: [  // Array of channel objects
		{
			chanid: Number,
			name: String,
			avatar: String,    // absolute URL to channel's avatar
			protected: Boolean // public if false
		},
		{
			chanid: Number,
			name: String,
			avatar: String,    // absolute URL to channel's avatar
			protected: Boolean // public if false
		},
		...
	]
}
```

Get user's channels <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /chat/channels

/* RESPONSE */
{
	id: String,
	channels: [  // Array of channel objects
		{
			chanid: Number,
			name: String,
			avatar: String	// absolute URL to channel's avatar
		},
		{
			chanid: Number,
			name: String,
			avatar: String	// absolute URL to channel's avatar
		},
		...
	]
}
```

#### CRUD Channel

Create channel <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels
{
	name: String,
	avatar: String,	 // absolute URL to channel's avatar
	type: String,	 // public/protected/private
	password: String // if protected
}
/* RESPONSE */
{
	chanid: Number
}
```

Get information about channel's members <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /chat/channels/:id

/* RESPONSE */
{
	chanid: Number,
	owner: String,	// id of the channel's owner (appears in members)
	admins: [ id: String, id: String, ... ], // appears in members
	muted: [ id: String, id: String ... ],	 // only visible by owner and admins (appears in members)
	members: [     // Array of user objects who joined channel
		{
			id: String,
			name: String,	// display name
			avatar: String,	// URL to avatar
			online: Boolean
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// URL to avatar
			online: Boolean
		},
		...
	],
	banned: [  // only visible by owner and admins
		{
			id: String,
			name: String,	// display name
			avatar: String	// URL to avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String	// URL to avatar
		},
		...
	]
}
```

Edit channel (user must be owner) <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
PUT /chat/channels/:id
{
	name: String,
	avatar: String,	   // absolute URL to channel's avatar
	type: String,	   // public/protected/private
	password: String   // if protected
}
/* RESPONSE */
{
	id: String,
	name: Boolean,	   // always true, channel's name does not have to be unique
	avatar: Boolean,   // always true, back-end won't check URL validity
	type: Boolean,	   // false if type couldn't become protected because of bad password, else true
	password: Boolean  // false if it didn't pass the password policy
}
```

Delete channel (user must be owner) <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
DELETE /chat/channels/:id

/* RESPONSE */
{
	ok: Boolean
}
```

#### Channel's messages

Get messages of a channel <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /chat/channels/:id/messages?from=from&to=to
{
	from: Number,	// 0 - most recent, n - n most recent messages
	to: Number
}
/* RESPONSE */
{
	chanid: Number,
	messages: [  // Array of messages
		{
			msgid: Number,
			sender: {
				id: String,	// 42 login
				name: String,	// Display name
				avatar: String	// URL to avatar
			},
			content: String	// message's content
		},
		{
			msgid: Number,
			sender: {
				id: String,	// 42 login
				name: String,	// Display name
				avatar: String	// URL to avatar
			},
			content: String	// message's content
		},
		...
	]
}
```

Send a message in a channel <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/messages
{
	content: String
}
/* RESPONSE */
{
	ok: Boolean
}
```

### Manage users' access

Join channel (when channel is public or protected) <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/join
{
	password: String  // if channel is protected
}
/* RESPONSE */
{
	chanid: String
}
```

Leave channel (if user is the owner, he has to choose a new owner) <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/leave
{
	newOwnerId: String // only if user is owner
}
/* RESPONSE */
{
	chanid: String
}
```

Add user to private channel <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/add
{
	id: String  // the id of the user to add
}
/* RESPONSE */
{
	id: String,
	chanid: String
}
```

Mute/Kick/Ban user (user sending one of these requests must be admin) <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/mute
POST /chat/channels/:id/kick
POST /chat/channels/:id/ban
{
	id: String,	// the id of the user to mute/kick/ban
	add: Boolean,	// true to mute/kick/ban, false to unmute/unban
	time: Date	// only needed for mute and kick
}
/* RESPONSE */
{
	id: String,
	chanid: String,
	res: Boolean	// true if successful (state changed)
}
```

Set role for channel's member (user sending this request must be owner), if role is owner then actual owner will become admin <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/role
{
	id: String,	// the user to change role
	role: String	// member/admin/owner
}
/* RESPONSE */
{
	id: String,
	chanid: String,
	res: Boolean	// true if successful (role changed)
}
```

Get my role in channel <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /chat/channels/:id/role

/* RESPONSE */
{
	id: String,
	chanid: String,
	role: String	// member/admin/owner/muted/banned
}
```

### Dms

Get friend's DMs <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /chat/users/:id?from=from&to=to
{
	from: Number, // 0 - most recent, n - n most recent messages
	to: Number
}
/* RESPONSE */
{
	id1: String, // me
	id2: String, // friend
	online: Boolean,
	invitation: String, // none/sent/received/succeed
	messages: [  // Array of messages
		{
			msgid: Number,
			senderid: String,
			content: String	// message's content
		},
		{
			msgid: Number,
			senderid: String,
			content: String	// message's content
		},
		...
	]
}
```

Send a DM to a friend <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/users/:id
{
	content: String
}
/* RESPONSE */
{
	ok: Boolean
}
```

Send a game invitation to a friend <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/users/:id/invite

/* RESPONSE */
{
	ok: Boolean
}
```

Accept/decline game invitation <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/users/:id/invite/response
{
	accept: Boolean
}
/* RESPONSE */
{
	ok: Boolean,
	gameid: String	// only if accept and ok are true
}
```
