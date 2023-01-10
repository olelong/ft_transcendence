import { Module } from "@nestjs/common";
import { msController } from "./ms.controller";

@Module({
	controllers: [msController]
})
export class msModule {

}
