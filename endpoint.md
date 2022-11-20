# Communication Endpoints

## User account

### Login
This request is sent after the 42 API has validated user's credential, no matter whether the user has been registered or not.
```js
/* REQUEST */
GET /user/login
{
	id: String,	// 42 login
	tfa: String	// the Google Auth 6-digit token (can be empty)
}
/* RESPONSE */
{
	id: String,
	ok: Boolean	// true if login successfully, false otherwise
}
```
### Profile
Get some user's basic attributes from their profile
```js
/* REQUEST */
GET /user/profile
{
	id: String		// 42 login
}
/* RESPONSE */
{
	id: String,
	name: String,	// display name
	avatar: String,	// absolute URL to user's avatar
}
```
Make changes to profile
```js
/* REQUEST */
POST /user/profile
{
	id: String		// 42 login
	name: String,	// display name, if empty default to 42 login
	avatar: String,	// absolute URL to user's avatar, if empty set to default URL
	tfa: Boolean,	// enable or disable 2-factor auth
}
/* RESPONSE */
{
	id: String,
	name: Boolean,	// display name is OK (unique
	avatar: Boolean,// always true, back-end won't check URL validity
	tfa: String		// URL to QR code if tfa turned from false to true, else empty
}
```
Get friend/blocked list
```js
/* REQUEST */
GET /user/friends
GET /user/blocks
{
	id: String,	// 42 login
	num: Number	// Max number of friends/blocked in response, 0 to get everyone
}
/* RESPONSE */
{
	id: String,
	users: [	// Array of user objects
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
		},
		{
			id: String,
			name: String,	// display name
			avatar: String,	// absolute URL to user's avatar
		},
		...
	]
}
```
Check if 2 users are friends/blocked
```js
/* REQUEST */
GET /user/friend
GET /user/block
{
	id1: String,// 42 login
	id2: String	// 42 login
}
/* RESPONSE */
{
	id1: String,
	id2: String,
	res: Boolean	// is id1 and id2 are friend/blocked
}
```
Add/remove friend/blocked
```js
/* REQUEST */
POST /user/friend
POST /user/block
{
	id1: String,	// 42 login
	id2: String,	// 42 login
	add: Boolean	// true if adding, false if removing
}
/* RESPONSE */
{
	id1: String,
	id2: String,
	res: Boolean	// true if successful (state changed)
}
```
_TO BE CONTINUED..._
