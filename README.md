# ft_transcendence

This is Damien's branch

### On 23/01:

- Spaghetti code completely dealt with. Separation of concerns is better respected. Only minor refactoring still needed
- Left to do: matchmaking (easy), Pong's game engine (complex but not hard), chat features (easy), database integration (complex), documenting protocols with frontend (very very hard)

### On 20/01:

- Implementing WebSocket features: matchmaking, games, game rooms, chat, chat rooms
- Testing mainly with Postman to mock frontend's request (frontend folder is basically dead - RIP)
- Containerizing with Docker seems easy, having only problem with getting service's hostname from within the containers (backend - frontend). Temporary solution: expose all ports to host machine and user `localhost`
- Backend still needs major refactoring (too much spaghetti code)
- Endpoint / Communication protocols need to be updated
