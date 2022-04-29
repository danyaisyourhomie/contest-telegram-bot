import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Config } from "entities/config.entity";
import { User } from "entities/user.entity";
import { UserV2 } from "entities/userv2.entity";
import { VoicesForBoys } from "entities/voices.boys.entity";
import { VoicesForGirls } from "entities/voices.girls.entity";
import { Repository } from "typeorm";

const MAX_ID_VALUE = 999999999;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly rep: Repository<User>,
    @InjectRepository(UserV2) private readonly repv2: Repository<UserV2>,
    @InjectRepository(Config) private readonly config: Repository<Config>,
    @InjectRepository(VoicesForBoys)
    private readonly boys: Repository<VoicesForBoys>,
    @InjectRepository(VoicesForGirls)
    private readonly girls: Repository<VoicesForGirls>
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

  async isVotingActive() {
    const config = await this.config.findOne({ type: "interactive" });
    return config?.votingActive;
  }

  async isSelectingLevelsActive() {
    const config = await this.config.findOne({ type: "interactive" });
    return config?.levelSelectingActive;
  }

  async extractScores(command: string, type: "girls" | "boys", id: number) {
    const cmd = command.trim();
    const scores =
      type === "girls" ? cmd.split("/voteGirls")[1] : cmd.split("/voteBoys")[1];

    if (!scores) {
      return {
        message:
          "Вы не проставили оценки участникам.\nПример команды: /voteGirls 1 2 3 4 5 (или /voteBoys 1 2 3 4)\n\nВызовите команду /vote для получения подробной инструкции по голосованию.",
      };
    }

    const hasStrings = scores.split(" ").every((s) => !isNaN(+s));

    if (!hasStrings) {
      return {
        message:
          "Нужно вводить цифры.\n\nВызовите команду /vote для получения подробной инструкции по голосованию.",
      };
    }
    const scoresList = scores
      .split(" ")
      .filter((s) => s.trim())
      .map((s) => +s);

    const scoresLength = scoresList.length;

    const enoughScores =
      type === "girls" ? scoresLength === 5 : scoresLength === 4;

    if (!enoughScores) {
      return {
        message:
          "Вы ввели неверное количество баллов!\nОценивая девушек, вы должны прислать 5 оценок.\nОценивая парней - 4 оценки.\n\nВызовите команду /vote для получения подробной инструкции по голосованию.",
      };
    }

    if (new Set(scoresList).size !== scoresLength) {
      return {
        message:
          "Оценки участникам не должны повторяться!\n\nВызовите команду /vote для получения подробной инструкции по голосованию.",
      };
    }

    const isMaxValueCorrect = scoresList.every((s) =>
      type === "girls" ? s <= 5 : s <= 4
    );

    if (!isMaxValueCorrect) {
      return {
        message:
          "Вы поставили слишком большую оценку как минимум одному из участников (участниц).\n\nВызовите команду /vote для получения подробной инструкции по голосованию.",
      };
    }

    const isMinValueCorrect = scoresList.every((s) => s >= 1);

    if (!isMinValueCorrect) {
      return {
        message:
          "Минимальная оценка - 1 балл.\n\nВызовите команду /vote для получения подробной инструкции по голосованию.",
      };
    }

    if (type === "girls") {
      await this.voteGirls(id, scoresList);
    } else {
      await this.voteBoys(id, scoresList);
    }

    return { message: "ok", scoresList };
  }

  async voteBoys(id: number, scores: Array<number>) {
    const user = await this.getUser(id);

    const vote: Partial<VoicesForBoys> = {
      userId: user.id.toString(),
      alexeev: scores[0],
      michalevich: scores[1],
      langraph: scores[2],
      galeev: scores[3],
    };

    this.boys.save(vote);
  }

  async voteGirls(id: number, scores: Array<number>) {
    const user = await this.getUser(id);

    const vote: Partial<VoicesForGirls> = {
      userId: user.id.toString(),
      baeva: scores[0],
      sudakova: scores[1],
      kozhina: scores[2],
      ermolaeva: scores[3],
      laukhina: scores[4],
    };

    this.girls.save(vote);
  }
}
