import { CRApi } from 'wrap-royale';
import { ConfigService } from './config/config.service.';
import { EmojiStorage } from './storages/emoji-storage';
import { EmojiHelper } from './util/emoji-helper';

export namespace InitHelper {
  export async function init(config: ConfigService): Promise<IInitObjects> {
    const emojiStorage: EmojiStorage = new EmojiStorage(config);
    await emojiStorage.fetchAvailableEmojis();
    const emojiHelper: EmojiHelper = new EmojiHelper(emojiStorage);
    const api: CRApi = new CRApi(config.crApi.url, config.crApi.token);

    return { emojiHelper, api };
  }
}

export interface IInitObjects {
  emojiHelper: EmojiHelper;
  api: CRApi;
}
