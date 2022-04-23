import { EchoModule } from "./echo/echo.module";
import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.ECHO_BOT_TOKEN,
      include: [EchoModule],
    }),
    EchoModule,
  ],
})
export class AppModule {}
