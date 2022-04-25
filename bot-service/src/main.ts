import "dotenv/config";

import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { RestModule } from "rest/rest.module";

async function bootstrap() {
  //  await NestFactory.createApplicationContext(AppModule);

  const bot = await NestFactory.create(AppModule);
  bot.listen(process.env.PORT);
}
bootstrap();
