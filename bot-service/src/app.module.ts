import { DEV_BOT } from "const";
import { EchoModule } from "./bot/bot.module";
import { Module } from "@nestjs/common";
import { RestModule } from "./rest/rest.module";
import { TelegrafModule } from "nestjs-telegraf";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserModule } from "./user/user.module";
import { sessionMiddleware } from "middleware/session.middleware";

@Module({
  imports: [
    UserModule,
    RestModule,
    EchoModule,
    TelegrafModule.forRootAsync({
      botName: DEV_BOT,
      useFactory: () => ({
        token: process.env.DEV_TELEGRAM_BOT,
        middlewares: [sessionMiddleware],
        include: [EchoModule],
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5433,
      username: "partnadem",
      password: "mysecretpassword",
      database: "db",
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
