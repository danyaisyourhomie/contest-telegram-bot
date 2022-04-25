/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUser(tg_id: number) {
    return await this.userService.getUser(tg_id);
  }
}
