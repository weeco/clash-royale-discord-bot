import * as Joi from 'joi';
import { ICRApiConfig } from './interfaces/cr-api-config.interface';
import { IDiscordConfig } from './interfaces/discord-config.interface';
import { IEnvConfig } from './interfaces/env-config.interface';
import { IMySqlConfig } from './interfaces/mysql-config.interface';
import { IRedisConfig } from './interfaces/redis-config.interface';

export class ConfigService {
  public get env(): string {
    return this.envConfig.NODE_ENV;
  }

  public get discord(): IDiscordConfig {
    return {
      token: this.envConfig.DISCORD_BOT_TOKEN,
      shardCount: Number(this.envConfig.DISCORD_SHARD_COUNT),
      adminChannelId: this.envConfig.DISCORD_ADMIN_CHANNEL_ID
    };
  }

  public get redis(): IRedisConfig {
    return {
      host: this.envConfig.REDIS_HOST,
      port: Number(this.envConfig.REDIS_PORT),
      db: Number(this.envConfig.REDIS_DB),
      username: this.envConfig.REDIS_USERNAME,
      password: this.envConfig.REDIS_PASSWORD,
      url: `redis://${this.envConfig.REDIS_USERNAME}:${this.envConfig.REDIS_PASSWORD}@${this.envConfig.REDIS_HOST}:${
        this.envConfig.REDIS_PORT
      }/${this.envConfig.REDIS_DB}`
    };
  }

  public get mysql(): IMySqlConfig {
    return {
      host: this.envConfig.MYSQL_HOST,
      username: this.envConfig.MYSQL_USERNAME,
      password: this.envConfig.MYSQL_PASSWORD,
      port: Number(this.envConfig.MYSQL_PORT),
      dbName: this.envConfig.MYSQL_DB_NAME,
      url: `mysql://${this.envConfig.MYSQL_USERNAME}:${this.envConfig.MYSQL_PASSWORD}@${this.envConfig.REDIS_HOST}:${
        this.envConfig.MYSQL_PORT
      }/${this.envConfig.MYSQL_DB_NAME}`
    };
  }

  public get crApi(): ICRApiConfig {
    return {
      token: this.envConfig.CR_API_TOKEN,
      url: this.envConfig.CR_API_BASE_URL
    };
  }

  private readonly envConfig: IEnvConfig;

  constructor() {
    const envConfig: IEnvConfig = process.env;
    this.envConfig = this.validateInput(envConfig);
  }

  /**
   * Ensures all needed variables are set and returns the process environment
   */
  private validateInput(envConfig: IEnvConfig): IEnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      // General
      NODE_ENV: Joi.string()
        .valid(['development', 'development-verbose', 'production', 'test', 'provision'])
        .default('development'),

      // Discord
      DISCORD_BOT_TOKEN: Joi.string().required(),
      DISCORD_SHARD_COUNT: Joi.number().required(),
      DISCORD_ADMIN_CHANNEL_ID: Joi.string().required(),

      // Redis
      REDIS_HOST: Joi.string().default('127.0.0.1'),
      REDIS_USERNAME: Joi.string().default(''),
      REDIS_PORT: Joi.number().default(6379),
      REDIS_DB: Joi.number().default(0),
      REDIS_PASSWORD: Joi.string().default(''),

      // MySQL
      MYSQL_HOST: Joi.string().default('127.0.0.1'),
      MYSQL_USERNAME: Joi.string().required(),
      MYSQL_PASSWORD: Joi.string().default(''),
      MYSQL_PORT: Joi.number().default(3306),
      MYSQL_DB_NAME: Joi.string().required(),

      // CR Api
      CR_API_TOKEN: Joi.string().required(),
      CR_API_BASE_URL: Joi.string().required()
    }).unknown();

    const { error, value: validatedEnvConfig } = Joi.validate(envConfig, envVarsSchema);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }
}
