/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from "@nestjs/common";
import { User } from "entities/user.entity";
import { Response } from "express";
import { createReadStream } from "fs";
import { PassThrough } from "stream";

import { RestService } from "./rest.service";

const jwt = require("jsonwebtoken");

@Controller()
export class RestController {
  constructor(private readonly restService: RestService) {}
  @Get("/ping")
  async ping(): Promise<string> {
    return "pong";
  }

  @Get("user/:id")
  async getUser(@Param("id") tg_id: number): Promise<User> {
    return await this.restService.getUser(tg_id);
  }

  @Get("qrcode/:id")
  async getQRCode(@Param("id") tg_id: number, @Res() res: Response) {
    const qrStream = new PassThrough();
    await this.restService.getQRCode(tg_id, qrStream);

    qrStream.pipe(res);
  }

  @Get("validate")
  async validateUser(@Query("token") token: string) {
    try {
      const data: { tg_id: number } = await jwt.verify(
        token,
        process.env.JWT_TOKEN
      );

      return await this.restService.getUser(data.tg_id);
    } catch (err) {
      console.log(err);

      throw new BadRequestException("Билет не прошёл валидацию");
    }
  }
}
