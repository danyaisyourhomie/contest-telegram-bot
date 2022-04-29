/*
https://docs.nestjs.com/modules
*/

import { Config } from "entities/config.entity";
import { Module } from "@nestjs/common";
import { RestController } from "./rest.controller";
import { RestService } from "./rest.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserService } from "user/user.service";
import { UserV2 } from "entities/userv2.entity";
import { VoicesForBoys } from "entities/voices.boys.entity";
import { VoicesForGirls } from "entities/voices.girls.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserV2,
      Config,
      VoicesForBoys,
      VoicesForGirls,
    ]),
  ],
  controllers: [RestController],
  providers: [RestService, UserService],
})
export class RestModule {}
