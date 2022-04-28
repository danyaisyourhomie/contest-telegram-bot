import { Column, Entity } from "typeorm";

import { BaseEntity } from "./base.entity";

@Entity()
export class VoicesForGirls extends BaseEntity {
  @Column({ nullable: true, default: "crowd" })
  userId: string;

  @Column({ default: 0 })
  baeva: number;
  @Column({ default: 0 })
  sudakova: number;
  @Column({ default: 0 })
  kozhina: number;
  @Column({ default: 0 })
  ermolaeva: number;
  @Column({ default: 0 })
  laukhina: number;
}
