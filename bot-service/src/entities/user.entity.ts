import { Column, Entity } from "typeorm";

import { BaseEntity } from "./base.entity";

export enum USER_REALM {
  ITMO = "ITMO",
  GUEST = "GUEST",
  NOT_STATED = "NOT_STATED",
}

@Entity()
export class User extends BaseEntity {
  @Column({ nullable: true })
  tg_id: number;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  username: string;

  @Column({ default: "ru" })
  language_code: string;

  @Column({ default: USER_REALM.NOT_STATED })
  realm: USER_REALM;
}
