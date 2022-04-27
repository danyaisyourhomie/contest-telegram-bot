import { BotUpdate } from "./bot.update";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserService } from "user/user.service";
import { UserV2 } from "entities/userv2.entity";
@Module({
  imports: [TypeOrmModule.forFeature([User, UserV2])],
  providers: [BotUpdate, UserService],
})
export class EchoModule {}
