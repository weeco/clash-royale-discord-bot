import { KeyedStorage, Message } from '@yamdbf/core';
import { HashtagHelper } from 'wrap-royale';

export namespace ParseHelper {
  export async function tryParseHashtag(
    message: Message,
    hashtagArg: string,
    userSettings: KeyedStorage
  ): Promise<string> {
    let hashtag: string;

    const hasMentions: boolean = message.mentions.members != null && message.mentions.members.size > 0;
    // Check if args are empty, then we know user wants to query the saved tag
    if (hashtagArg == null && !hasMentions) {
      hashtag = <string>await userSettings.get(`${message.author.id}.hashtag`);
      if (hashtag == null) {
        throw new Error('Unable to find a tag linked to your discord account. Please save your tag and try it again.');
      }

      return hashtag;
    } else if (hasMentions) {
      hashtag = <string>await userSettings.get(`${message.mentions.members.first().id}.hashtag`);
      if (hashtag == null) {
        throw new Error('Unable to find a tag linked to that discord account.');
      }

      return hashtag;
    } else {
      hashtag = hashtagArg;
    }

    hashtag = HashtagHelper.normalizeHashtag(hashtag);
    // Validate the fetched hashtag
    if (!HashtagHelper.isValidHashtag(hashtag)) {
      throw new Error(`The read hashtag '${hashtag}' is invalid`);
    }

    return hashtag;
  }
}
