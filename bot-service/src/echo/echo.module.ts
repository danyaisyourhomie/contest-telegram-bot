import { EchoService } from "./echo.service";
import { EchoUpdate } from "./echo.update";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [EchoUpdate, EchoService],
})
export class EchoModule {}
