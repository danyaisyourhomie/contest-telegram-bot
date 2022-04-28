import { Column, Entity } from "typeorm";

import { BaseEntity } from "./base.entity";

@Entity()
export class VoicesForBoys extends BaseEntity {
  @Column({ nullable: true, default: "crowd" })
  userId: string;

  @Column({ default: 0 })
  alexeev: number;
  @Column({ default: 0 })
  michalevich: number;
  @Column({ default: 0 })
  langraph: number;
  @Column({ default: 0 })
  galeev: number;
}
