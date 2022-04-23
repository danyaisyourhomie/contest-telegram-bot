import { UseFilters, UseInterceptors } from "@nestjs/common";
import { Help, InjectBot, On, Start, Update, Ctx } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { Context } from "../interfaces/context.interface";
import { ResponseTimeInterceptor } from "../common/interceptors/response-time.interceptor";
import { TelegrafExceptionFilter } from "../common/filters/telegraf-exception.filter";
import { DEV_BOT } from "const";
import { confirmRealmKeyboard, sigInKeyboard } from "common/keyboards";
import { EchoService } from "./echo.service";
import { BOT_ACTIONS_TYPE } from "common/actions";
import { Repository } from "typeorm";
import { User, USER_REALM } from "entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { send } from "process";

@Update()
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(TelegrafExceptionFilter)
export class EchoUpdate {
  constructor(
    @InjectBot(DEV_BOT)
    private readonly bot: Telegraf<Context>,
    private readonly userService: EchoService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  @On("callback_query")
  async onBotAction(@Ctx() ctx) {
    const { action } = JSON.parse(ctx.update.callback_query.data);

    const callback_data = JSON.parse(ctx.update.callback_query.data);

    await this.getBotAction(action, callback_data, ctx);
  }

  @Start()
  async onStart(@Ctx() ctx) {
    const { id: userId } = ctx.from;

    await this.bot.telegram.sendMessage(
      userId,
      `Приветствую! Это официальный бот мероприятия "Мистер и Мисс ИТМО 2022!\nЧтобы получить свой заветный билет на шоу, зарегистрируйтесь как зритель.`,
      {
        parse_mode: "HTML",
        reply_markup: sigInKeyboard.reply_markup,
      }
    );
  }

  @Help()
  async onHelp(): Promise<string> {
    return "Send me any text";
  }

  @On("text")
  onMessage(@Ctx() ctx) {
    const user = ctx.message.from;
  }

  async getBotAction(action: BOT_ACTIONS_TYPE, data, ctx) {
    switch (action) {
      case BOT_ACTIONS_TYPE.SIGN_IN:
        return await this.registerUser(ctx);
      case BOT_ACTIONS_TYPE.CONFIRM_REALM:
        return await this.saveUserRealm(ctx, data);
    }
  }

  async getUserRealm(userData: User) {
    const { id: userId } = userData;

    await this.bot.telegram.sendMessage(
      userId,
      `Дорогой пользователь, также укажите, откуда вы:`,
      {
        parse_mode: "HTML",
        reply_markup: confirmRealmKeyboard.reply_markup,
      }
    );
  }

  async registerUser(@Ctx() ctx) {
    const userData = ctx.from;

    try {
      const user = await this.userRepository.findOne({
        where: { tg_id: userData.id },
      });

      if (user) {
        await this.bot.telegram.sendMessage(
          userData.id,
          `${userData.first_name}, вы уже были зарегистрированы!`
        );

        return;
      }

      await this.userRepository.save({
        ...userData,
        tg_id: userData.id,
        realm: USER_REALM.ITMO,
      });

      await this.bot.telegram.sendMessage(
        userData.id,
        `Вы были успешно зарегистрированы! Ждём Вас 29 апреля в 18:30 в Театре «ЛДМ»!`
      );

      this.getUserRealm(userData);
    } catch (err) {
      console.log(err);
      await this.bot.telegram.sendMessage(
        userData.id,
        `Упс, что-то странное произошло - регистрация прошла неудачно.\nПопробуйте заново через некоторое время. либо обратитесь к @partnadem.`
      );
    }
  }

  async saveUserRealm(@Ctx() ctx, callback_data: { realm: USER_REALM }) {
    const userData = ctx.from;

    const user = await this.userRepository.findOne({
      where: { tg_id: userData.id },
    });

    if (!user) {
      await this.send(
        userData.id,
        "Такого пользователя нет в базе.\nВыполните комаду /start, чтобы зарегистрироваться."
      );
    }

    console.log(callback_data);

    await this.userRepository.update(
      { tg_id: userData.id },
      { realm: callback_data.realm }
    );

    await this.send(userData.id, "Информация обновлена!");
  }

  async send(receiverId: number, message: string) {
    await this.bot.telegram.sendMessage(receiverId, message);
  }
}
