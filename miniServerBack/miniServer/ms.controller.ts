import { Controller, Post, Get } from "@nestjs/common";

// localhost:8888/auth/
@Controller("ms")
export class msController {
	constructor(private service: /*AuthService*/) {}

	//EXEMPLES DE ENDPOINTS:
	// POST localhost:8888/auth/login
	@Post("login")
	login(o: Object) { return this.service.login(); }

	// POST localhost:8888/auth/login/s&i
	@Post("login")
	login(String: s, int: i) { return this.service.login(); }

	@Post("register")
	register() { return this.service.register(); }

	@Get("yooyoo")
	yooyoo() {
		return [
					{
						"user": "yooyoo1",
						"avatar": "/default.jpg"
					},
					{
						"user": "yooyoo2",
						"avatar": "/default.jpg"
					},
					{
						"user": "yooyoo3",
						"avatar": "/default.jpg"
					}
				];
	}
}
