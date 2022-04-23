import { Column, Entity } from "typeorm";

import { BaseEntity } from "./base.entity";

export enum USER_REALM {
  ITMO = "ITMO",
  GUEST = "GUEST",
  NOT_STATED = "NOT_STATED",
}

@Entity()
export class User extends BaseEntity {
  @Column()
  tg_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  username: string;

  @Column({ default: "ru" })
  language_code: string;

  @Column({ default: USER_REALM.NOT_STATED })
  realm: USER_REALM;
}
