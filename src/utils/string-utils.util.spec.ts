import StringUtils from './string-utils.util';

describe('StringUtils', () => {
  describe('getTransform', () => {
    it('should return "lowercase" for lowercase text', () => {
      const result = StringUtils.getTransform('lowercase');
      expect(result).toBe('lowercase');
    });

    it('should return "uppercase" for uppercase text', () => {
      const result = StringUtils.getTransform('UPPERCASE');
      expect(result).toBe('uppercase');
    });

    it('should return "capitalize" for capitalize text', () => {
      const result = StringUtils.getTransform('Capitalize');
      expect(result).toBe('capitalize');
    });

    it('should throw an error for unknown text transform', () => {
      expect(() => StringUtils.getTransform('MixedCase')).toThrowError(
        'not possible to get text transform',
      );
    });
  });

  describe('transform', () => {
    it('should transform to lowercase', () => {
      const result = StringUtils.transform('LowerCase', 'lowercase');
      expect(result).toBe('lowercase');
    });

    it('should transform to uppercase', () => {
      const result = StringUtils.transform('UpperCase', 'uppercase');
      expect(result).toBe('UPPERCASE');
    });

    it('should capitalize the first letter', () => {
      const result = StringUtils.transform('capitalize', 'capitalize');
      expect(result).toBe('Capitalize');
    });

    it('should throw an error for unknown transform', () => {
      expect(() =>
        StringUtils.transform('text', 'unknown' as never),
      ).toThrowError('invalid transform value');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter', () => {
      const result = StringUtils.capitalizeFirstLetter("i'm fantastic");
      expect(result).toBe("I'm fantastic");
    });
  });

  describe('titleCase', () => {
    it('should title case the phrase', () => {
      const result = StringUtils.titleCase("i'm fantastic");
      expect(result).toBe("I'm Fantastic");
    });

    it('should title case the phrase - ignore first index', () => {
      const result = StringUtils.titleCase("i'm fantastic", [0]);
      expect(result).toBe("i'm Fantastic");
    });

    it('should title case the phrase - ignore second index', () => {
      const result = StringUtils.titleCase("I'm fantastic", [1]);
      expect(result).toBe("I'm fantastic");
    });
  });

  describe('isUrl', () => {
    it('should return true for a valid URL', () => {
      const result = StringUtils.isUrl('https://www.example.com');
      expect(result).toBe(true);
    });

    it('should return false for an invalid URL', () => {
      const result = StringUtils.isUrl('This is not a URL');
      expect(result).toBe(false);
    });
  });

  describe('isImageUrl', () => {
    it('should return true for a valid image URL', () => {
      const validImageURLs = [
        'https://www.example.com/image.jpg',
        'http://image-site.com/pic.png',
        'https://img-site.net/picture.gif',
      ];

      validImageURLs.forEach(url => {
        expect(StringUtils.isImageUrl(url)).toBe(true);
      });
    });

    it('should return false for an invalid image URL', () => {
      const invalidImageURLs = [
        'https://www.example.com/not_an_image.txt',
        'https://non-image-site.org/file.doc',
        'https://invalid-url',
      ];

      invalidImageURLs.forEach(url => {
        expect(StringUtils.isImageUrl(url)).toBe(false);
      });
    });
  });

  describe('isImage', () => {
    it('should return true for a valid image extension', () => {
      const validExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'JPG',
        'JPEG',
        'PNG',
        'GIF',
        'BMP',
      ];

      validExtensions.forEach(extension => {
        expect(StringUtils.isImage(`image.${extension}`)).toBe(true);
        expect(StringUtils.isImage(`picture.${extension}`)).toBe(true);
      });
    });

    it('should return false for an invalid image extension', () => {
      const invalidExtensions = [
        'txt',
        'doc',
        'pdf',
        'zip',
        'mp3',
        'TXT',
        'DOC',
        'PDF',
        'ZIP',
        'MP3',
      ];

      invalidExtensions.forEach(extension => {
        expect(StringUtils.isImage(`file.${extension}`)).toBe(false);
        expect(StringUtils.isImage(`document.${extension}`)).toBe(false);
      });
    });
  });

  describe('splitFileNameAndExtension', () => {
    it('splits filename and extension correctly', () => {
      const testCases = [
        { input: 'image.jpg', expected: { name: 'image', extension: 'jpg' } },
        {
          input: 'document.doc',
          expected: { name: 'document', extension: 'doc' },
        },
        { input: 'picture', expected: { name: 'picture', extension: '' } },
        // { input: '.hidden', expected: { name: '.hidden', extension: '' } },
        { input: '', expected: { name: '', extension: '' } },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(StringUtils.splitFileNameAndExtension(input)).toEqual(expected);
      });
    });
  });

  describe('hasExtension', () => {
    it('recognizes filenames with extensions', () => {
      const filenamesWithExtensions = [
        'image.jpg',
        'document.doc',
        'script.js',
      ];

      filenamesWithExtensions.forEach(filename => {
        expect(StringUtils.hasExtension(filename)).toBe(true);
      });
    });

    it('rejects filenames without extensions', () => {
      const filenamesWithoutExtensions = ['picture', 'file.', '.hidden', ''];

      filenamesWithoutExtensions.forEach(filename => {
        expect(StringUtils.hasExtension(filename)).toBe(false);
      });
    });
  });
});
