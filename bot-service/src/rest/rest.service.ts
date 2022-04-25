/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Repository } from "typeorm";

const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");

@Injectable()
export class RestService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async getUser(tg_id: number): Promise<User | null> {
    return await this.userRepository.findOne({ tg_id });
  }

  async getQRCode(tg_id: number, stream) {
    await QRCode.toFileStream(
      stream,
      jwt.sign({ tg_id }, process.env.JWT_TOKEN),
      {
        type: "png",
        width: 512,
        errorCorrectionLevel: "H",
      }
    );
  }
}
