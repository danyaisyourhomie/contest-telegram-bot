import { DEV_BOT } from "const";
import { EchoModule } from "./echo/echo.module";
import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { sessionMiddleware } from "middleware/session.middleware";

@Module({
  imports: [
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
