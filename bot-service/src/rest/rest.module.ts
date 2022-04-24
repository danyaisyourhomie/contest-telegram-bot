/*
https://docs.nestjs.com/modules
*/

import { Module } from "@nestjs/common";
import { RestController } from "./rest.controller";
import { RestService } from "./rest.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RestController],
  providers: [RestService],
})
export class RestModule {}
