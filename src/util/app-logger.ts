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

  public log(message: string, trace?: {}): void {
    this.logger.log('info', message, trace);
  }

  public warn(message: string, trace?: {}): void {
    this.logger.warn(message, trace);
  }

  public info(message: string, trace?: {}): void {
    this.logger.info(message, trace);
  }

  public error(message: string, trace?: {} | string): void {
    this.logger.error(message, trace);
  }
}
