import { Controller, Post, Get } from "@nestjs/common";

// localhost:8888/auth/
@Controller("ms")
export class msController {
	constructor(private service: /*AuthService*/) {}

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
