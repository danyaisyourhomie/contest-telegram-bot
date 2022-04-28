import { BOT_ACTIONS_TYPE } from "common/actions";
import { Keyboard } from "telegram-keyboard";
import { USER_REALM } from "entities/user.entity";

const LEVEL_BUTTON = [
  [
    {
      text: "Сонный паралич",
      type: "button",
      callback_data: JSON.stringify({
        action: BOT_ACTIONS_TYPE.CHOOSE_NEXT_LEVEL,
        level: 0,
      }),
    },
  ],
  [
    {
      text: "Онейроидный синдром",
      type: "button",
      callback_data: JSON.stringify({
        action: BOT_ACTIONS_TYPE.CHOOSE_NEXT_LEVEL,
        level: 1,
      }),
    },
  ],
  [
    {
      text: "Гипнотический транс",
      type: "button",
      callback_data: JSON.stringify({
        action: BOT_ACTIONS_TYPE.CHOOSE_NEXT_LEVEL,
        level: 2,
      }),
    },
  ],
];

export const sigInKeyboard = Keyboard.make([
  {
    text: "Зарегистрироваться",
    type: "button",
    callback_data: JSON.stringify({
      action: BOT_ACTIONS_TYPE.SIGN_IN,
    }),
  },
]).inline();

export const confirmRealmKeyboard = Keyboard.make([
  {
    text: "из ИТМО",
    type: "button",
    callback_data: JSON.stringify({
      action: BOT_ACTIONS_TYPE.CONFIRM_REALM,
      realm: USER_REALM.ITMO,
    }),
  },
  {
    text: "не из ИТМО",
    type: "button",
    callback_data: JSON.stringify({
      action: BOT_ACTIONS_TYPE.CONFIRM_REALM,
      realm: USER_REALM.GUEST,
    }),
  },
]).inline();

export const confirmLevel = Keyboard.make(LEVEL_BUTTON).inline();
