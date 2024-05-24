export type Transform = 'lowercase' | 'uppercase' | 'capitalize';

class StringUtils {
  public static getTransform(value: string): Transform {
    if (value === value.toLowerCase()) {
      return 'lowercase';
    }

    if (value === value.toUpperCase()) {
      return 'uppercase';
    }

    if (/\b[A-Z][a-z]+\b/.test(value)) {
      return 'capitalize';
    }

    throw new Error('not possible to get text transform');
  }

  public static transform(value: string, transform: Transform): string {
    if (transform === 'lowercase') {
      return value.toLowerCase();
    }

    if (transform === 'uppercase') {
      return value.toUpperCase();
    }

    if (transform === 'capitalize') {
      const lower = value.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    throw new Error('invalid transform value');
  }

  /**
   * @example "i'm fantastic -> I'm fantastic"
   */
  public static capitalizeFirstLetter(word: string): string {
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  /**
   * @example "I'm fantastic -> I'm Fantastic"
   * @argument {number[]} ignoreWordIndexes - indexes of words to not capitalize
   */
  public static titleCase(
    phrase: string,
    ignoreWordIndexes?: number[],
  ): string {
    const words = phrase.toLowerCase().split(' ');

    for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
      if (ignoreWordIndexes && ignoreWordIndexes.includes(wordIndex)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      words[wordIndex] =
        words[wordIndex].charAt(0).toUpperCase() +
        words[wordIndex].substring(1);
    }
    return words.join(' ');
  }

  public static isUrl(value: string): boolean {
    const urlRegex = /\bhttps?:\/\/\S+\b/;
    return urlRegex.test(value);
  }

  public static isImageUrl(url: string): boolean {
    const imageRegex = /^https?:\/\/(?:\S+)?\.(jpg|jpeg|png|gif|bmp)$/i;
    return imageRegex.test(url);
  }

  public static isImage(value: string): boolean {
    const imageExtensionRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
    return imageExtensionRegex.test(value);
  }

  public static splitFileNameAndExtension(filename: string): {
    name: string;
    extension: string;
  } {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return {
        name: filename,
        extension: '',
      };
    }

    const name = filename.slice(0, lastDotIndex);
    const extension = filename.slice(lastDotIndex + 1);

    return {
      name,
      extension,
    };
  }

  public static hasExtension(filename: string): boolean {
    const lastDotIndex = filename.lastIndexOf('.');
    return (
      lastDotIndex !== -1 &&
      lastDotIndex !== 0 &&
      lastDotIndex !== filename.length - 1
    );
  }
}

export default StringUtils;
