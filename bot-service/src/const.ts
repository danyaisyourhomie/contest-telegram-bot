export const DEV_BOT = "DEV_BOT";

export enum LOGGER_JOBS {
  REST = "rest-service",
  BOT = "bot-service",
  TICKET = "ticket-service",
  USER_MESSAGES = "user-messages",
  BOT_MESSAGES = "bot-messages",
}

export enum LOG_LABELS {
  MESSAGE_FROM_BOT = "message-from-bot",
  MESSAGE_FROM_USER = "message-from-user",
  BOT_ERROR = "bot-error",
  BOT_ACTION = "bot-action",
  USER_ACTION = "user-action",
  GET_USER = "get-user",
  PING_SERVICE = "ping-service",
  CREATE_TICKET = "create-ticket",
  SEND_TICKET = "send-ticket",
  VALIDATE_TICKET = "validate-ticket",
  CHECKED_TICKET = "success-ticket",
  EARLY_TICKET = "early-ticket",
  USER_REGISTRATION = "user-registration",
  CHOOSE_LEVEL = "choose-level",
}

const QRCODE_BGCOLOR = "71868F";
const QRCODE_COLOR = "FFFFFF";

export const QRCODE_SERVICE_API = (data: string, size?: string) => {
  return `http://api.qrserver.com/v1/create-qr-code/?data=${data}&size=${
    size ?? "256x256"
  }&margin=25&bgcolor=${QRCODE_BGCOLOR}&color=${QRCODE_COLOR}`;
};

export const QRCODE_VALIDATION_SERVICE_HOST =
  "https://misster.partnadem.com/validate/?token=";
