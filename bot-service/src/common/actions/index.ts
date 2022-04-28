export enum BOT_ACTIONS_TYPE {
  SIGN_IN = "SIGN_IN",
  CONFIRM_REALM = "CONFIRM_REALM",
  CHOOSE_NEXT_LEVEL = "CHOOSE_NEXT_LEVEL",
}

export const BOT_ACTIONS = {
  [BOT_ACTIONS_TYPE.SIGN_IN]: {
    text: "Зарегистрироваться",
  },
  [BOT_ACTIONS_TYPE.CONFIRM_REALM]: {
    text: "Зарегистрироваться",
  },
};
