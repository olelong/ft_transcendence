# ft_transcendence

This is Damien's branch

Current progress:

- Implementing WebSocket features: matchmaking, games, game rooms, chat, chat rooms
- Testing mainly with Postman to mock frontend's request (frontend folder is basically dead - RIP)
- Containerizing with Docker seems easy, having only problem with getting service's hostname from within the containers (backend - frontend). Temporary solution: expose all ports to host machine and user `localhost`
- Backend still needs major refactoring (too much spaghetti code)
- Endpoint / Communication protocols need to be updated
