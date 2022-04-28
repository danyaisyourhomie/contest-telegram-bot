/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QRCODE_VALIDATION_SERVICE_HOST } from "const";
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
    const token = jwt.sign(tg_id, process.env.JWT_TOKEN);

    const code = await QRCode.toFileStream(
      stream,
      QRCODE_VALIDATION_SERVICE_HOST + token,
      {
        type: "png",
        width: 512,
        errorCorrectionLevel: "H",
      }
    );

    return code;
  }
}
