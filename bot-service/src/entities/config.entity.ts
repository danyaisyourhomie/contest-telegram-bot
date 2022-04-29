import { Column, Entity } from "typeorm";

import { BaseEntity } from "./base.entity";

@Entity()
export class Config extends BaseEntity {
  @Column({ default: "interactive" })
  type: string;

  @Column({ default: false })
  votingActive: boolean;

  @Column({ default: false })
  levelSelectingActive: boolean;

  @Column({ default: true })
  registrationIsActive: boolean;
}
