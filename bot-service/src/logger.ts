import { LOGGER_JOBS, LOG_LABELS } from "const";

const { createLogger, transports, format } = require("winston");
const LokiTransport = require("winston-loki");

const LOGGER_HOST = "http://localhost:5100";

const APP_LABEL = "app";

export function getUserLogLabel(userId: number, label: LOG_LABELS) {
  return { userId, label };
}

export function getRestLogLabel(label: LOG_LABELS) {
  return { label };
}

function initLogger(tag: LOGGER_JOBS) {
  return createLogger({
    format: format.combine(format.splat()),
    transports: [
      new LokiTransport({
        host: LOGGER_HOST,
        labels: {
          service: tag,
          app: APP_LABEL,
        },
      }),
    ],
  });
}

const restLogger = initLogger(LOGGER_JOBS.REST);

const botLogger = initLogger(LOGGER_JOBS.BOT);

const ticketLogger = initLogger(LOGGER_JOBS.TICKET);

module.exports = {
  ticketLogger,
  botLogger,
  restLogger,
  getUserLogLabel,
  getRestLogLabel,
  LOGGER_JOBS,
  LOG_LABELS,
};
