const { createLogger, transports } = require('winston');
const LokiTransport = require('winston-loki');

const options = createLogger({
  transports: [
    new LokiTransport({
      host: 'http://loki:5100',
      labels: {
        job: 'api-gateway',
      },
    }),
  ],
});

const logger = createLogger(options);

console.log(logger);

module.exports = logger;
