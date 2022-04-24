import { EchoService } from "./auth.service";
import { EchoUpdate } from "./auth.update";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [EchoUpdate, EchoService],
})
export class EchoModule {}
