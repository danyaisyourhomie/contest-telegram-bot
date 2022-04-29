import { Config } from "entities/config.entity";
import { DEV_BOT } from "const";
import { EchoModule } from "./bot/bot.module";
import { Module } from "@nestjs/common";
import { RestModule } from "./rest/rest.module";
import { TelegrafModule } from "nestjs-telegraf";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserModule } from "./user/user.module";
import { UserV2 } from "entities/userv2.entity";
import { VoicesForBoys } from "entities/voices.boys.entity";
import { VoicesForGirls } from "entities/voices.girls.entity";
import { sessionMiddleware } from "middleware/session.middleware";

const {
  DEV_TELEGRAM_BOT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  PORT,
  MODE,
  POSTGRES_HOST,
  PG_PORT,
} = process.env;

@Module({
  imports: [
    UserModule,
    RestModule,
    EchoModule,
    TelegrafModule.forRootAsync({
      botName: DEV_BOT,
      useFactory: () => ({
        token: DEV_TELEGRAM_BOT,
        middlewares: [sessionMiddleware],
        include: [EchoModule],
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: POSTGRES_HOST,
      port: PG_PORT as unknown as number,
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
      entities: [User, UserV2, VoicesForGirls, VoicesForBoys, Config],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
