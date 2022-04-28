import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from "@nestjs/common";
import { LOG_LABELS } from "const";
import { User } from "entities/user.entity";
import { Response } from "express";
import { createReadStream } from "fs";
import { PassThrough } from "stream";
import { UserService } from "user/user.service";

import { RestService } from "./rest.service";

const jwt = require("jsonwebtoken");

const { restLogger, ticketLogger, getRestLogLabel } = require("../logger");

const HOST = "https://misster.partnadem.com/";

@Controller()
export class RestController {
  constructor(
    private readonly restService: RestService,
    private readonly userService: UserService
  ) {}
  @Get("/ping")
  async ping(): Promise<string> {
    restLogger.info({
      message: "Rest service was pinged",
      labels: getRestLogLabel(LOG_LABELS.PING_SERVICE),
    });
    return "pong";
  }

  @Get("user/:id")
  async getUser(@Param("id") tg_id: number): Promise<User> {
    restLogger.info({
      message: "User profile was received",
      tg_id,
      labels: { ...getRestLogLabel(LOG_LABELS.GET_USER), tg_id },
    });

    if (!+tg_id) {
      throw new BadRequestException("Невалидный id");
    }

    return await this.userService.getUser(tg_id);
  }

  @Get("qrcode/:id")
  async getQRCode(@Param("id") tg_id: number, @Res() res: Response) {
    ticketLogger.info({
      message: "QR CODE was received",
      tg_id,
      labels: { ...getRestLogLabel(LOG_LABELS.CREATE_TICKET), tg_id },
    });
    const qrStream = new PassThrough();
    await this.restService.getQRCode(tg_id, qrStream);

    qrStream.pipe(res);
  }

  @Get("validate")
  async validateUser(@Query("token") token: string, @Res() res) {
    try {
      ticketLogger.info({
        message: "Проверяю билет...",
        token,
        labels: { ...getRestLogLabel(LOG_LABELS.CREATE_TICKET) },
      });

      if (!token.length) {
        throw new BadRequestException("Невалидный QRCODE");
      }
      const tg_id: number = await jwt.verify(token, process.env.JWT_TOKEN);

      const user = await this.userService.getUser(tg_id);

      ticketLogger.info({
        message: "Билет прошёл проверку",
        token,
        user,
        labels: {
          ...getRestLogLabel(LOG_LABELS.CHECKED_TICKET),
          userId: tg_id,
        },
      });

      return res.redirect(HOST + "success.html");
    } catch (err) {
      console.log(err);
      ticketLogger.warn({
        message: "Билет не прошёл валидацию",
        token,
        err,
        labels: { ...getRestLogLabel(LOG_LABELS.CHECKED_TICKET) },
      });
      return res.redirect(HOST + "fail.html");
    }
  }
}
