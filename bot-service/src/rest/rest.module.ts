/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { RestController } from "./rest.controller";
import { RestService } from "./rest.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserService } from "user/user.service";
import { UserV2 } from "entities/userv2.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserV2])],
  controllers: [RestController],
  providers: [RestService, UserService],
})
export class RestModule {}
