/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserV2 } from "entities/userv2.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserV2])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
