import { Column, Entity } from "typeorm";

import { User } from "./user.entity";

@Entity()
export class UserV2 extends User {
  @Column()
  big_tg_id: string;
}
