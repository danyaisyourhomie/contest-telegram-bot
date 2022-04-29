import { UseFilters, UseInterceptors } from "@nestjs/common";
import {
  Help,
  InjectBot,
  On,
  Start,
  Update,
  Ctx,
  Command,
} from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { Context } from "../interfaces/context.interface";
import { ResponseTimeInterceptor } from "../common/interceptors/response-time.interceptor";
import { TelegrafExceptionFilter } from "../common/filters/telegraf-exception.filter";
import {
  DEV_BOT,
  LOG_LABELS,
  QRCODE_SERVICE_API,
  QRCODE_VALIDATION_SERVICE_HOST,
} from "const";
import {
  confirmLevel,
  confirmRealmKeyboard,
  sigInKeyboard,
} from "common/keyboards";
import { BOT_ACTIONS_TYPE } from "common/actions";
import { User, USER_REALM } from "entities/user.entity";
import { UserService } from "user/user.service";

const { botLogger, getUserLogLabel, ticketLogger } = require("../logger");

const jwt = require("jsonwebtoken");

const bannedIdsForLevels = [];

const levels = {
  0: "Сонный паралич",
  1: "Онейроидный синдром",
  2: "Гипнотический транс",
};

@Update()
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class BotUpdate {
  constructor(
    @InjectBot(DEV_BOT)
    private readonly bot: Telegraf<Context>,
    private readonly userService: UserService
  ) {}

  // DEFAULT COMMANDS

  @Start()
  async onStart(@Ctx() ctx) {
    const { id: userId } = ctx.from;

    botLogger.info({
      message: "Ввёл команду /start",
      labels: getUserLogLabel(userId, LOG_LABELS.USER_ACTION),
    });

    await this.send(
      userId,
      `Приветствую! Это официальный бот мероприятия "Мистер и Мисс ИТМО 2022!"\nЧтобы получить свой заветный билет на шоу, зарегистрируйтесь как зритель.`,
      {
        parse_mode: "HTML",
        reply_markup: sigInKeyboard.reply_markup,
      }
    );
  }

  @Help()
  async onHelp(@Ctx() ctx): Promise<string> {
    const { id: userId } = ctx.from;

    botLogger.info({
      message: "Ввёл команду /help",
      labels: getUserLogLabel(userId, LOG_LABELS.USER_ACTION),
    });
    return "Нажмите /start, чтобы начать\nНажмите /ticket, чтобы получить свой билет.";
  }

  @On("callback_query")
  async onBotAction(@Ctx() ctx) {
    const { action } = JSON.parse(ctx.update.callback_query.data);

    const callback_data = JSON.parse(ctx.update.callback_query.data);

    await this.getBotAction(action, callback_data, ctx);
  }

  // NEXT LEVEL

  @Command("nextLevel")
  async chooseLevel(@Ctx() ctx: Context) {
    const { id } = ctx.from;

    if (!(await this.checkLevels())) {
      return "Выбор уровня закрыт";
    }

    await this.send(id, `Выберите синдром:`, {
      parse_mode: "HTML",
      reply_markup: confirmLevel.reply_markup,
    });
  }

  async confirmNextLevel(@Ctx() ctx: Context, userId, { level }) {
    const user = await this.userService.getUser(userId);

    if (!user) {
      this.send(
        userId,
        "Вы не можете голосовать, так как не зарегистрировались. Введите /start, чтобы залогиниться в боте. "
      );
      return;
    }

    const nextLevel = levels[level || 0] || levels[0];

    if (bannedIdsForLevels.includes(userId)) {
      this.send(userId, "Вы уже сделали свой выбор.");

      ticketLogger.warn({
        message: `${user?.first_name || "Пользователь"} ${
          user?.last_name || ""
        } попытался снова выбрать следующий уровень. На этот раз ${nextLevel}`,
        labels: getUserLogLabel(userId, LOG_LABELS.CHOOSE_LEVEL),
      });
      return;
    }

    bannedIdsForLevels.push(userId);
    this.send(userId, `Вы выбрали "${nextLevel}"`);

    ticketLogger.info({
      message: `${user?.first_name || "Пользователь"} ${
        user?.last_name || ""
      } выбрал следующий уровень: ${nextLevel}`,
      labels: getUserLogLabel(userId, LOG_LABELS.CHOOSE_LEVEL),
    });
  }

  // SEND TICKET

  @Command("ticket")
  async sendTicket(@Ctx() ctx: Context) {
    const { id: userId } = ctx.from;

    const user = await this.userService.getUser(userId);

    if (!user) {
      await this.send(
        userId,
        "Вы не зарегистрировались. Выполните команду /start."
      );

      botLogger.info({
        message: "Попытался получить билет без регистрации",
        labels: getUserLogLabel(userId, LOG_LABELS.EARLY_TICKET),
      });

      return;
    }

    try {
      const ticket = await this.getTicket(userId);

      await this.bot.telegram.sendPhoto(userId, ticket);

      ticketLogger.info({
        message: `Получил билет`,
        labels: getUserLogLabel(userId, LOG_LABELS.SEND_TICKET),
      });
    } catch (err) {
      console.log(err);

      await this.bot.telegram.sendMessage(
        userId,
        "Упс, не получилось сгенерировать для вас билет. Попробуйте ещё раз через некоторое время. Для получения помощи напишите @partnadem."
      );

      ticketLogger.warn({
        message: `Не смог получить билет`,
        labels: getUserLogLabel(userId, LOG_LABELS.SEND_TICKET),
      });
    }
  }

  async getTicket(userId: number) {
    try {
      const token = jwt.sign(userId, process.env.JWT_TOKEN);

      ticketLogger.info({
        message: `Билет создан`,
        labels: getUserLogLabel(userId, LOG_LABELS.CREATE_TICKET),
        token,
      });

      return await QRCODE_SERVICE_API(QRCODE_VALIDATION_SERVICE_HOST + token);
    } catch (err) {
      console.log(err);

      ticketLogger.warn({
        message: `Билет не был создан`,
        labels: getUserLogLabel(userId, LOG_LABELS.CREATE_TICKET),
      });
    }
  }

  // VOTE
  @Command("vote")
  async voteCommand(@Ctx() ctx) {
    const { id: userId } = ctx.from;

    if (!(await this.checkVoting())) {
      botLogger.warn({
        message: `Попытался проголосовать раньше времени`,
        labels: getUserLogLabel(userId, LOG_LABELS.VOTING_EARLY),
      });
      return "Голосование закрыто";
    }

    await this.send(
      userId,
      `>>> Голосование за кандидатов

Данный процесс разделен на 2 этапа:

1) Сначала нужно проголосовать за участниц (/voteGirls)
2) потом за участников (/voteBoys)

Каждая команда позволяет проголосовать за соответствующую группу участников / участниц:

Девушки:
Дарья Баева
Мария Судакова
Дарья Кожина
Асия Ермолаева
Ольга Лаухина

Парни:
Антон Алексеев
Максим Михалевич
Владислав Ландграф
Рашид Галеев

Вместе с командной нужно прислать баллы в соответствии с порядком выступления кандидатов:
- от 1 до 5, голосуя за участниц
- от 1 до 4, голосуя за участников

Где 5 (4) - это самый высокий балл.

При этом оценки не должны повторяться. Например:

/voteGirls 1 2 3 4 5

/voteBoys 4 3 2 1

Пример неправильного ввода:

/voteGirls 4 4 4 4 4
/voteBoys 1 1 1 1

На протяжении всего концерта вы сможете поменять своё решение, снова вызвав команды /voteGirls и /voteBoys, передав желаемые баллы.
`
    );

    botLogger.info({
      message: `Начал голосование`,
      labels: getUserLogLabel(userId, LOG_LABELS.VOTING_COMMAND),
    });
  }

  @Command("voteGirls")
  async voteGirls(@Ctx() ctx) {
    const { id: userId, first_name, last_name } = ctx.from;
    const user = `${first_name || "Пользователь"} ${last_name || ""}`;

    if (!(await this.checkVoting())) {
      return "Голосование закрыто";
    }

    const { text } = ctx.message;

    const { message: msg, scoresList } = await this.userService.extractScores(
      text,
      "girls",
      userId
    );

    if (msg !== "ok") {
      botLogger.warn({
        message: `${user} неправильно проголосовал за девушек`,
        msg,
        scoresList,
        labels: getUserLogLabel(userId, LOG_LABELS.VOTING),
      });
      return msg;
    }

    botLogger.info({
      message: `${user} проголосовал за девушек`,
      scoresList,
      labels: getUserLogLabel(userId, LOG_LABELS.VOTING),
    });

    await this.send(
      userId,
      `>>> Вы проставили следующие оценки:

Дарья Баева - ${scoresList[0]}
Мария Судакова - ${scoresList[1]}
Дарья Кожина - ${scoresList[2]}
Асия Ермолаева - ${scoresList[3]}
Ольга Лаухина - ${scoresList[4]}

Если хотите изменить своё решение, пропишите снова команду /voteGirls

Если ещё не проголосовали за парней, выполните команду /voteBoys

Правила голосования: /vote`
    );
  }

  @Command("voteBoys")
  async voteBoys(@Ctx() ctx) {
    const { id: userId, first_name, last_name } = ctx.from;
    const user = `${first_name || "Пользователь"} ${last_name || ""}`;

    if (!(await this.checkVoting())) {
      return "Голосование закрыто";
    }

    const { text } = ctx.message;

    const { message: msg, scoresList } = await this.userService.extractScores(
      text,
      "boys",
      userId
    );

    if (msg !== "ok") {
      botLogger.warn({
        message: `${user} неправильно проголосовал за парней`,
        msg,
        scoresList,
        labels: getUserLogLabel(userId, LOG_LABELS.VOTING),
      });
      return msg;
    }

    botLogger.info({
      message: `${user} проголосовал за парней`,
      scoresList,
      labels: getUserLogLabel(userId, LOG_LABELS.VOTING),
    });

    await this.send(
      userId,
      `>>> Вы проставили следующие оценки:

Антон Алексеев - ${scoresList[0]}
Максим Михалевич - ${scoresList[1]}
Владислав Ландграф - ${scoresList[2]}
Рашид Галеев - ${scoresList[3]}

Если хотите изменить своё решение, пропишите снова команду /voteBoys

Если ещё не проголосовали за девушек, выполните команду /voteGirls

Правила голосования: /vote`
    );
  }

  async checkVoting() {
    const isActive = await this.userService.isVotingActive();

    return isActive;
  }

  async checkLevels() {
    const isActive = await this.userService.isSelectingLevelsActive();

    return isActive;
  }

  @On("text")
  async onMessage(@Ctx() ctx) {
    const { id: userId } = ctx.from;

    const { text } = ctx.message;

    botLogger.info({
      message: `Ввёл текст "${text}"`,
      labels: getUserLogLabel(userId, LOG_LABELS.MESSAGE_FROM_USER),
    });
  }

  async getBotAction(action: BOT_ACTIONS_TYPE, data, ctx) {
    const { id: userId } = ctx.from;

    botLogger.info({
      message: `Нажал на кнопку ${action}`,
      labels: getUserLogLabel(userId, LOG_LABELS.USER_ACTION),
    });

    switch (action) {
      case BOT_ACTIONS_TYPE.SIGN_IN:
        return await this.registerUser(ctx);
      case BOT_ACTIONS_TYPE.CONFIRM_REALM:
        return await this.saveUserRealm(ctx, data);
      case BOT_ACTIONS_TYPE.CHOOSE_NEXT_LEVEL:
        return await this.confirmNextLevel(ctx, userId, data);
    }
  }

  async getUserRealm(userData: User) {
    const { tg_id: userId } = userData;

    if (userData.realm !== USER_REALM.NOT_STATED) {
      await this.finishRegistration(userId);
      return;
    }

    botLogger.info({
      message: `Получил сообщение о уточнении университета`,
      labels: getUserLogLabel(userId, LOG_LABELS.USER_ACTION),
    });

    await this.send(userId, `Дорогой пользователь, также укажите, откуда вы:`, {
      parse_mode: "HTML",
      reply_markup: confirmRealmKeyboard.reply_markup,
    });
  }

  async registerUser(@Ctx() ctx) {
    const userData = ctx.from;

    botLogger.info({
      message: `Начал регистрацию в боте`,
      userData,
      labels: getUserLogLabel(userData.id, LOG_LABELS.USER_ACTION),
    });

    try {
      const user = await this.userService.getUser(userData.id);

      if (user) {
        await this.send(
          userData.id,
          `${userData.first_name}, вы уже были зарегистрированы!`
        );

        botLogger.info({
          message: `Уже был зарегистрирован`,
          userData,
          labels: getUserLogLabel(userData.id, LOG_LABELS.USER_ACTION),
        });

        this.getUserRealm(user);

        return;
      }

      const savedUser = await this.userService.saveUser(userData.id, {
        ...userData,
        realm: USER_REALM.NOT_STATED,
      });

      await this.send(
        userData.id,
        `Вы были успешно зарегистрированы! Ждём Вас 29 апреля в 18:30 в Театре «ЛДМ»!`
      );

      botLogger.info({
        message: `Зарегистрировался`,
        userData,
        labels: getUserLogLabel(userData.id, LOG_LABELS.USER_REGISTRATION),
      });

      this.getUserRealm(savedUser);
    } catch (err) {
      console.log(err);

      botLogger.warn({
        message: `Не смог зарегистрироваться`,
        userData,
        err,
        labels: getUserLogLabel(userData.id, LOG_LABELS.USER_ACTION),
      });

      await this.send(
        userData.id,
        `Упс, что-то странное произошло - регистрация прошла неудачно.\nПопробуйте заново через некоторое время. либо обратитесь к @partnadem.`
      );
    }
  }

  async saveUserRealm(@Ctx() ctx, callback_data: { realm: USER_REALM }) {
    const userData = ctx.from;

    botLogger.info({
      message: `Обновляет данные об университете`,
      userData,
      labels: getUserLogLabel(userData.id, LOG_LABELS.BOT_ACTION),
    });

    const user = await this.userService.getUser(userData.id);

    if (!user) {
      botLogger.warn({
        message: `Пользователь не был найден при обновлении университета`,
        userData,
        labels: getUserLogLabel(userData.id, LOG_LABELS.BOT_ERROR),
      });

      await this.send(
        userData.id,
        "Такого пользователя нет в базе.\nВыполните комаду /start, чтобы зарегистрироваться."
      );
    }

    await this.userService.updateUser(userData.id, {
      realm: callback_data.realm,
    });

    botLogger.info({
      message: `Пользователь обновил университет`,
      userData,
      realm: callback_data.realm,
      labels: getUserLogLabel(userData.id, LOG_LABELS.BOT_ACTION),
    });

    await this.send(userData.id, "Информация обновлена!");

    await this.finishRegistration(userData.id);
  }

  async finishRegistration(userId: number) {
    await this.send(
      userId,
      "Теперь вы можете получить свой билет для посещения мероприятия. Введите команду /ticket"
    );
  }

  async send(receiverId: number, message: string, options?) {
    if (!receiverId) {
      return;
    }

    botLogger.info({
      message: `Пользователь получил сообщение "${message}"`,
      tg_id: receiverId,
      labels: getUserLogLabel(receiverId, LOG_LABELS.MESSAGE_FROM_BOT),
    });
    await this.bot.telegram.sendMessage(receiverId, message, options);
  }
}
