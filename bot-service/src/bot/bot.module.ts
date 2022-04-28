import { BotUpdate } from "./bot.update";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserService } from "user/user.service";
import { UserV2 } from "entities/userv2.entity";
import { VoicesForBoys } from "entities/voices.boys.entity";
import { VoicesForGirls } from "entities/voices.girls.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserV2, VoicesForGirls, VoicesForBoys]),
  ],
  providers: [BotUpdate, UserService],
})
export class EchoModule {}
