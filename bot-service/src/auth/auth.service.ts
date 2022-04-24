import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class EchoService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  echo(text: string): string {
    return `Вы ввели: ${text}`;
  }

  async register(data: User) {
    console.log(this.userRepository);

    // const user = await this.userRepository.findOne({
    //   where: { tg_id: data.tg_id },
    // });

    // if (user) {
    //   return `${user.first_name}, вы уже были зарегистрированы!`;
    // }

    // await this.userRepository.save(user);

    return "Вы были успешно зарегистрированы! Ждём Вас 29 апреля в 18:30 в Театре «ЛДМ»";
  }
}
