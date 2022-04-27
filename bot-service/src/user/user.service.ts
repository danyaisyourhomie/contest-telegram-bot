import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { UserV2 } from "entities/userv2.entity";
import { Repository } from "typeorm";

const MAX_ID_VALUE = 999999999;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly rep: Repository<User>,
    @InjectRepository(UserV2) private readonly repv2: Repository<UserV2>
  ) {}

  async getUser(tg_id: number): Promise<User | null> {
    if (tg_id > MAX_ID_VALUE) {
      const user = await this.repv2.findOne({ big_tg_id: tg_id.toString() });

      return user ? { ...user, tg_id } : null;
    }
    return await this.rep.findOne({ tg_id });
  }

  async saveUser(tg_id: number, updateBody: Partial<User>): Promise<User> {
    if (tg_id > MAX_ID_VALUE) {
      delete updateBody.id;

      const user = await this.repv2.save({
        ...updateBody,
        tg_id: 0,
        big_tg_id: tg_id.toString(),
      });

      return { ...user, tg_id };
    }
    return await this.rep.save({ tg_id, ...updateBody });
  }

  async updateUser(tg_id: number, updateBody: Partial<User>) {
    if (tg_id > MAX_ID_VALUE) {
      delete updateBody.id;
      const user = this.repv2.update(
        { big_tg_id: tg_id.toString() },
        { ...updateBody, tg_id: 0 }
      );

      return { ...user, tg_id };
    }
    return await this.rep.update({ tg_id }, { ...updateBody });
  }
}
