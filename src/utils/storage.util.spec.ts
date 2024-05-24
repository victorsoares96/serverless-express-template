import fs from 'fs';
import path from 'path';
import { AppError } from '@/errors/AppError';
import Storage, { LOCAL_STORAGE_PATH } from './storage.util';
import StringUtils from './string-utils.util';

// jest.mock('fs');
// jest.mock('path');
// jest.mock('sharp');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-cloudfront');
// jest.mock('./env.util');
// jest.mock('./log.util');
// jest.mock('./string-utils.util');

describe('Storage Local', () => {
  const storage = new Storage({ storage: 'local' });

  describe('getFileId', () => {
    it('should get file id', () => {
      const result = storage.getFileId(
        'http://localhost:3333/bucket/766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg',
      );

      expect(result).toBe('766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg');
    });
  });

  describe('getFilename', () => {
    it('should get file name', () => {
      const result = storage.getFilename(
        '766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg',
      );

      expect(result).toBe('test.jpg');
    });
  });

  describe('getObject', () => {
    it('should throw error if provide unknown storage type', () => {
      const unknownStorage = new Storage({ storage: 'any' as never });

      expect(() =>
        unknownStorage.getObject(
          '766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg',
        ),
      ).toThrow('any is a unknown storage type');
    });

    it('should to get object', () => {
      const object = storage.getObject(
        '766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg',
      );

      expect(object).toEqual({
        fileId: '766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg',
        fileName: 'test.jpg',
        thumbnail:
          'http://localhost:3333/bucket/766b25ff-6257-4520-862f-9dd788c1ee64_test_thumb.jpg',
        url: 'http://localhost:3333/bucket/766b25ff-6257-4520-862f-9dd788c1ee64_test.jpg',
      });
    });
  });

  describe('readObject', () => {
    it('should read local object', async () => {
      fs.writeFileSync(
        path.resolve(LOCAL_STORAGE_PATH, 'tmp_file.txt'),
        'john doe',
      );

      const object = await storage.readObject(
        'http://localhost:3333/bucket/tmp_file.txt',
      );

      expect(object).toBeInstanceOf(Buffer);

      fs.unlinkSync(path.resolve(LOCAL_STORAGE_PATH, 'tmp_file.txt'));
    });
  });

  describe('uploadObject', () => {
    it('should upload object', async () => {
      jest.spyOn(StringUtils, 'hasExtension').mockReturnValue(true);
      jest.spyOn(StringUtils, 'isUrl').mockReturnValue(false);
      jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
      jest.spyOn(Storage.prototype, 'generateThumbnail').mockImplementation(
        () =>
          new Promise(resolve => {
            resolve(Buffer.from([]));
          }),
      );

      const fileData = Buffer.from('file data');
      const result = await storage.uploadObject(
        'test.jpg',
        fileData,
        'image/jpeg',
      );

      expect(result).toEqual({
        url: expect.stringMatching(
          /http:\/\/localhost:3333\/bucket\/.*_test.jpg/,
        ),
        thumbnail: expect.stringMatching(
          /http:\/\/localhost:3333\/bucket\/.*_test_thumb.jpg/,
        ),
        fileName: 'test.jpg',
        fileId: expect.stringMatching(/.*_test.jpg/),
      });
    });

    it('should throw error if file has no extension', async () => {
      jest.spyOn(StringUtils, 'hasExtension').mockReturnValue(false);

      await expect(
        storage.uploadObject('test', Buffer.from('file data'), 'image/jpeg'),
      ).rejects.toThrow(AppError);
    });
  });

  describe('copyObject', () => {
    beforeAll(() => {
      jest.restoreAllMocks();
    });

    it('should copy object to local storage', async () => {
      fs.writeFileSync(
        path.resolve(LOCAL_STORAGE_PATH, 'tmp_file.txt'),
        'john doe',
      );

      const object = await storage.copyObject(
        'tmp_file.txt',
        'tmp_file_copy.txt',
      );

      expect(
        fs.existsSync(path.resolve(LOCAL_STORAGE_PATH, object.fileId)),
      ).toBeTruthy();

      fs.unlinkSync(path.resolve(LOCAL_STORAGE_PATH, 'tmp_file.txt'));
      fs.unlinkSync(path.resolve(LOCAL_STORAGE_PATH, object.fileId));
    });

    it('should copy object to local storage with thumbnail', async () => {
      fs.cpSync(
        path.join(__dirname, 'image.png'),
        path.resolve(LOCAL_STORAGE_PATH, 'tmp_image.jpeg'),
      );

      const object = await storage.copyObject(
        'tmp_image.jpeg',
        'tmp_image_copy.jpeg',
      );

      expect(
        fs.existsSync(path.resolve(LOCAL_STORAGE_PATH, object.fileId)),
      ).toBeTruthy();
      expect(
        fs.existsSync(
          path.resolve(
            LOCAL_STORAGE_PATH,
            storage.getFileId(object.thumbnail!),
          ),
        ),
      ).toBeTruthy();

      fs.unlinkSync(path.resolve(LOCAL_STORAGE_PATH, 'tmp_image.jpeg'));
      fs.unlinkSync(path.resolve(LOCAL_STORAGE_PATH, object.fileId));
      fs.unlinkSync(
        path.resolve(LOCAL_STORAGE_PATH, storage.getFileId(object.thumbnail!)),
      );
    });

    it('should throw AppError if storage type is unknown', async () => {
      const unknownStorage = new Storage({ storage: 'unknown' as never });

      await expect(
        unknownStorage.copyObject('test_file.jpg', 'source_path'),
      ).rejects.toThrow(AppError);
      await expect(
        unknownStorage.copyObject('test_file.jpg', 'source_path'),
      ).rejects.toThrow('unknown is unknown storage type');
    });
  });
});
