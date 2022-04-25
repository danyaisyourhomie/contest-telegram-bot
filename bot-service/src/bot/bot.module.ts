import { BotUpdate } from "./bot.update";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserService } from "user/user.service";
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [BotUpdate, UserService],
})
export class EchoModule {}
