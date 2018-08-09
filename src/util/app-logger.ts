import { createLogger, format, Logger, transports } from 'winston';

const { combine, timestamp, label, json } = format;

export class AppLogger {
  private readonly logger: Logger;

  constructor(context: string) {
    const processId: number = process.pid;

    this.logger = createLogger({
      transports: [
        new transports.Console({
          format: combine(label({ label: context }), label({ processId }), timestamp(), json())
        })
      ],
      exitOnError: true
    });
  }

  public log(message: string): void {
    this.logger.log('info', message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public error(message: string, trace?: {} | string): void {
    this.logger.error(message, { trace });
  }
}
