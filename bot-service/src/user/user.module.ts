/*
https://docs.nestjs.com/modules
*/

import { Config } from "entities/config.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserV2 } from "entities/userv2.entity";
import { VoicesForBoys } from "entities/voices.boys.entity";
import { VoicesForGirls } from "entities/voices.girls.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserV2,
      VoicesForGirls,
      VoicesForBoys,
      Config,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
