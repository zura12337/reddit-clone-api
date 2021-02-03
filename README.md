# Reddit Clone API
---

## Routes 🔚

### Registration / Authorization 👤
- ###### POST `api/users/` - Register User.
###### Example body:
```json
{
	"username": "John",
	"email": "your.mail@gmail.com",
	"password": "password",
}
```
###### Returns JWT token as cookie (httpOnly)
- ###### POST `/api/auth/` - Login User.
###### Example body:
```json
{
	"email": "your.mail@gmail.com",
	"password": "password"
}
```
###### Returns JWT token as cookie (httpOnly)
- ###### GET `api/users/me` - Get current logged user information.
- ###### GET `api/users/:id` - Get user information by id.
- ###### GET `api/users/logout` - Logout.

### Posts 📄
- ###### GET `api/posts/` - If user is authenticated, get posts from joined  communities, else get posts from every community.
- ###### GET `api/posts/:id` - Get post by id.
- ###### POST `api/posts/` - Add new post.
###### Example body:
```json
{
	"title": "Post title",
	"body": "post body should be at least 10 characters long",
	"image": "image link",
	"postedTo": "60118b873262f7bc6d1d33e0", // target community id
	"votes": 0
}
```
###### Example response:
```json
{
	"postedAt": "03-02-2021 7:05",
	"_id": "601ac39825644d90b1f23fbd", // post id
	"title": "Post title", 
	"body": "post body should be at least 10 characters long",
	"image": "image link",
	"postedTo": "60118b873262f7bc6d1d33e0", // community id
	"votes": 0,
	"postedBy": "601ac04225644d90b1f23fbc" // user id
}
```
- ###### POST - `api/post/:id/action` 
###### Example body:
```json
{
	"action": "like" // Like Post
}
{
	"action": "unlike" // Unlike Post
}
```

### Community 👥
- ###### GET `/api/community/` - Returns all communities.
- ###### GET `/api/community/:id` - Returns community by given id.
- ###### POST `/api/community/` - Create New Community
###### Example body:
```json
{
	"name": "community name",
	"description": "community description",
	"image": "community image link"
}
```
###### Example response:
```json
{
    "members": [
        "601ac04225644d90b1f23fbc" // user who created community.
    ],
    "posts": [],
    "_id": "601ac67925644d90b1f23fbe", // community id
    "name": "community name",
    "description": "community description",
    "image": "community image link"
}
```
- ###### POST `api/community/:id/join` - Join in community.

---

### Upcoming updates

- Comments on post
- Share post 
- Save post 
- Private communities
