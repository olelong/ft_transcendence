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
	access_token: String	// 42api access_token
}
/* RESPONSE */
{
	tfaRequired: Boolean,
	newUser: Boolean,
	token: String	// for cookie (only appears if tfaRequired is false)
}
```

This request is sent if tfa is required
```js
/* REQUEST */
POST /user/login/tfa
{
	access_token: String,	// 42api access_token
	tfa: String	// the Google Auth 6-digit token (can be empty)
}
/* RESPONSE */
{
	token: String // for cookie
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
	avatar: String,	// relative URL to user's avatar
	achievements: [
		{
			name: String,
			desc: String,
			img: String,	// relative URL to badge's image
			score: Number,
			goal: Number
		},
		{
			name: String,
			desc: String,
			img: String,	// relative URL to badge's image
			score: Number,
			goal: Number
		},
		...
	],
	stats: {
		wins: Number,
		loses: Number,
		rank: Number
	},
	games: [
		{
			id: String, // login of opponent
			myScore: Number,
			enemyScore: Number,
			timestamp: Date
		},
		{
			id: String, // login of opponent
			myScore: Number,
			enemyScore: Number,
			timestamp: Date
		},
		...
	],
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
	avatar: String, // relative URL to user's image
	theme: String,
	tfa: Boolean	// enable or disable 2-factor auth
}
/* RESPONSE */
{
	name: Boolean,	// display name is OK (unique
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
	valid: Boolean
}
```

Get friends list <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /user/friends

/* RESPONSE */
{
	friends: [    // Array of user objects (mutual friends)
		{
			id: String,
			name: String,	// display name
			avatar: String	// relative URL to user's avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String	// relative URL to user's avatar
		},
		...
	],
	pending: [ // Array of user objects (users who send friend request)
		{
			id: String,
			name: String,	// display name
			avatar: String	// relative URL to user's avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String	// relative URL to user's avatar
		},
		...
	],
}
```

Get blocked list <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /user/blocks

/* RESPONSE */
{
	users: [    // Array of user objects
		{
			id: String,
			name: String,	// display name
			avatar: String	// relative URL to user's avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String	// relative URL to user's avatar
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
	ok: Boolean	// is id1 and id2 are friend/blocked
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
	ok: Boolean	// true if successful (state corresponds to request)
}
```

## Image

Upload image
```js
/* REQUEST */
POST /image
{
	image: binary
}
/* RESPONSE */
{
	url: String	// relative path to image (/image/:imgname)
}
```

Get image
```js
/* REQUEST */
GET /image/:imgname

/* RESPONSE */
{
	binary
}
```

## Game

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
			avatar: String,	// relative URL to user's avatar
			score: Number	// calculated score
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// relative URL to user's avatar
			score: Number	// calculated score
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// relative URL to user's avatar
			score: Number	// calculated score
		}
	]
}
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
			avatar: String,    // relative URL to channel's avatar
			protected: Boolean // public if false
		},
		{
			chanid: Number,
			name: String,
			avatar: String,    // relative URL to channel's avatar
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
	channels: [  // Array of channel objects
		{
			chanid: Number,
			name: String,
			avatar: String	// relative URL to channel's avatar
		},
		{
			chanid: Number,
			name: String,
			avatar: String	// relative URL to channel's avatar
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
	avatar: String,	 // relative URL to channel's avatar
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
	owner: String,	  // id of the channel's owner (appears in members)
	admins: String[], // admins ids (appear in members)
	muted: String[],  // muted members ids, only visible by owner and admins (appear in members)
	members: [     // Array of user objects who joined channel
		{
			id: String,
			name: String,	// display name
			avatar: String,	// URL to avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// URL to avatar
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
	avatar: String,	   // relative URL to channel's avatar
	type: String,	   // public/protected/private
	password: String   // if protected
}
/* RESPONSE */
{
	ok: Boolean
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
	ok: Boolean
}
```

Leave channel (if user is the owner, he has to choose a new owner) <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
POST /chat/channels/:id/leave
{
	id: String // new owner id, only if user is owner
}
/* RESPONSE */
{
	ok: Boolean
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
	ok: Boolean
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
	ok: Boolean	// true if successful (role corresponds to request)
}
```

Get my role in channel <img src="https://cdn-icons-png.flaticon.com/512/1791/1791961.png" alt="auth icon" width="30px" style="vertical-align: middle;" />
```js
/* REQUEST */
GET /chat/channels/:id/role

/* RESPONSE */
{
	role: String, // member/admin/owner/muted/banned
	time?: Date // for muted or banned
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
