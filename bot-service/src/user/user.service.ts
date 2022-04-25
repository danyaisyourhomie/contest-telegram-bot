/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly rep: Repository<User>) {}

  async getUser(tg_id: number): Promise<User> {
    return this.rep.findOne({ tg_id });
  }

  async updateUser(tg_id: number, updateBody: Partial<User>): Promise<User> {
    return this.rep.save({ tg_id, ...updateBody });
  }
}
