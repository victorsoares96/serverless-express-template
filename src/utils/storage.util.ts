import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  // GetBucketWebsiteCommand,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
  CreateInvalidationCommandInput,
  ListDistributionsCommand,
} from '@aws-sdk/client-cloudfront';
import env from './env.util';
import log from './log.util';
import StringUtils from './string-utils.util';
import { AppError } from '@/errors/AppError';

export const LOCAL_STORAGE_PATH = path.resolve(__dirname, '../../bucket');

export type StorageType = 's3' | 'local';

export type StorageObject = {
  url: string;
  thumbnail: string | null;
  fileName: string;
  fileId: string;
};

type FileData = string | Buffer;

type Options = {
  storage?: StorageType;
  /**
   * Only works with storage type `local`.
   *
   * Default is `bucket` folder in project root.
   */
  outputPath?: string;
};

class Storage {
  private storage: StorageType;

  private region: string;

  private bucket: string;

  private s3: S3Client;

  private cloudFront: CloudFrontClient;

  private outputPath = LOCAL_STORAGE_PATH;

  constructor(options?: Options) {
    this.storage = options?.storage || env.get<StorageType>('storage');
    this.region = env.get<string>('s3.AWS_REGION');
    this.bucket = env.get<string>('s3.AWS_S3_BUCKET');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: env.get('s3.AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('s3.AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.cloudFront = new CloudFrontClient({
      region: this.region,
      credentials: {
        accessKeyId: env.get('s3.AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('s3.AWS_SECRET_ACCESS_KEY'),
      },
    });

    if (options?.outputPath) {
      this.outputPath = options.outputPath;
    }
  }

  private async isBucketUsingCloudFront(): Promise<boolean> {
    /* const websiteConfig = await this.s3.send(
      new GetBucketWebsiteCommand({ Bucket: this.bucket }),
    );

    if (
      websiteConfig &&
      websiteConfig.RoutingRules &&
      websiteConfig.RoutingRules.length > 0
    ) {
      log.info(`bucket ${this.bucket} is using CloudFront invalidation.`);
      return true;
    } */

    // If the bucket doesn't have a website configuration, check CloudFront distributions
    const distributions = await this.cloudFront.send(
      new ListDistributionsCommand({}),
    );

    if (distributions.DistributionList?.Items) {
      // eslint-disable-next-line no-restricted-syntax
      for (const distribution of distributions.DistributionList.Items) {
        if (
          distribution.Origins?.Items &&
          distribution.Origins.Items.some(
            origin => origin.DomainName === `${this.bucket}.s3.amazonaws.com`,
          )
        ) {
          log.info(
            `bucket ${this.bucket} is associated with CloudFront distribution ${distribution.Id}.`,
          );
          return true;
        }
      }
    }

    log.info(`bucket ${this.bucket} is not using CloudFront invalidation.`);
    return false;
  }

  private async createInvalidation(items: string[]): Promise<void> {
    const params: CreateInvalidationCommandInput = {
      DistributionId: env.get<string>('cloudfront.distributionId'),
      InvalidationBatch: {
        CallerReference: String(new Date().getTime()),
        Paths: {
          Quantity: items.length,
          Items: items.map(item => `/${item}*`),
        },
      },
    };

    const createInvalidationCommand = new CreateInvalidationCommand(params);
    await this.cloudFront.send(createInvalidationCommand);
  }

  public getFileId(fileUrl: string): string {
    const fileUrlSplitted = fileUrl.split('/');
    const fileId = fileUrlSplitted[fileUrlSplitted.length - 1];
    return fileId;
  }

  public getFilename(fileId: string): string {
    const parts = fileId.split('_');
    if (parts.length > 1) {
      return parts.slice(1).join('_');
    }
    return fileId;
  }

  private getLocalObject(fileId: string): StorageObject {
    return {
      url: `${env.get('hostname')}/bucket/${fileId}`,
      thumbnail: StringUtils.isImage(fileId)
        ? `${env.get('hostname')}/bucket/${this.generateThumbnailName(fileId)}`
        : null,
      fileName: this.getFilename(fileId),
      fileId,
    };
  }

  private getS3Object(fileId: string): StorageObject {
    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileId}`,
      thumbnail: `https://${this.bucket}.s3.${
        this.region
      }.amazonaws.com/${this.generateThumbnailName(fileId)}`,
      fileName: this.getFilename(fileId),
      fileId,
    };
  }

  public getObject(fileId: string): StorageObject {
    if (this.storage === 'local') {
      return this.getLocalObject(fileId);
    }

    if (this.storage === 's3') {
      return this.getS3Object(fileId);
    }

    throw new AppError(`${this.storage} is a unknown storage type`);
  }

  private async readLocalObject(url: string): Promise<Buffer> {
    const fileId = this.getFileId(url);

    const object = await fs.promises.readFile(
      path.resolve(LOCAL_STORAGE_PATH, fileId),
    );
    return object;
  }

  private async readRemoteObject(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError(`failed to download file: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  }

  public async readObject(url: string): Promise<Buffer> {
    if (this.storage === 'local') {
      return this.readLocalObject(url);
    }

    return this.readRemoteObject(url);
  }

  private async uploadObjectLocal(
    fileId: string,
    fileData: FileData,
    mimeType?: string,
  ): Promise<StorageObject> {
    let file: Buffer;

    if (typeof fileData === 'string' && StringUtils.isUrl(fileData)) {
      file = await this.readObject(fileData);
    } else {
      file = fileData as Buffer;
    }

    if (mimeType?.startsWith('image')) {
      const thumb = await this.generateThumbnail(file);
      await fs.promises.writeFile(
        `${this.outputPath}/${this.generateThumbnailName(fileId)}`,
        thumb,
      );
    }

    await fs.promises.writeFile(`${this.outputPath}/${fileId}`, file);

    return this.getLocalObject(fileId);
  }

  private async copyObjectLocal(
    sourceFileId: string,
    destinationFileName: string,
  ): Promise<StorageObject> {
    const object = this.getObject(sourceFileId);
    const data = await this.readObject(object.url);
    const mimeType = mime.lookup(object.fileName);

    return this.uploadObject(destinationFileName, data, mimeType || undefined);
  }

  private async uploadObjectS3(
    fileId: string,
    fileData: FileData,
    mimeType?: string,
  ): Promise<StorageObject> {
    let file: Buffer | string;

    if (typeof fileData === 'string' && StringUtils.isUrl(fileData)) {
      file = await this.readObject(fileData);
    } else {
      file = fileData;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileId,
      Body: file,
      ContentType: mimeType,
    });

    await this.s3.send(command);

    const invalidations = [fileId];

    if (mimeType?.startsWith('image') && typeof file !== 'string') {
      const thumbName = `${this.generateThumbnailName(fileId)}`;
      const thumb = await this.generateThumbnail(file);
      command.input.Key = thumbName;
      command.input.Body = thumb;
      await this.s3.send(command);

      invalidations.push(thumbName);
    }

    const isBucketUsingCloudFront = await this.isBucketUsingCloudFront();
    if (isBucketUsingCloudFront) await this.createInvalidation(invalidations);

    return this.getS3Object(fileId);
  }

  private async copyObjectS3(
    sourceFileId: string,
    destinationFileName: string,
  ): Promise<StorageObject> {
    const destinationFileId = `${uuidv4()}_${destinationFileName}`;
    const mimeType = mime.lookup(sourceFileId);

    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: destinationFileId,
      CopySource: this.getObject(sourceFileId).url,
      ContentType: mimeType || undefined,
    });

    await this.s3.send(command);

    const isImage = StringUtils.isImage(sourceFileId);

    if (isImage) {
      command.input.Key = this.generateThumbnailName(destinationFileId);
      command.input.CopySource = this.getS3Object(sourceFileId).thumbnail!;
      await this.s3.send(command);
    }

    return this.getS3Object(destinationFileId);
  }

  public async uploadObject(
    fileName: string,
    fileData: FileData,
    mimeType?: string,
  ): Promise<StorageObject> {
    const hasExtension = StringUtils.hasExtension(fileName);

    if (!hasExtension) {
      throw new AppError(`${fileName} has no extension`);
    }

    const fileId = `${uuidv4()}_${fileName}`;

    if (!mimeType) {
      mimeType = mime.lookup(fileName) || undefined;
    }

    if (this.storage === 'local') {
      const file = await this.uploadObjectLocal(fileId, fileData, mimeType);
      return file;
    }

    if (this.storage === 's3') {
      const file = await this.uploadObjectS3(fileId, fileData, mimeType);
      return file;
    }

    throw new AppError(`${this.storage} is unknown storage type`);
  }

  public async copyObject(
    sourceFileId: string,
    destinationFileName: string,
  ): Promise<StorageObject> {
    if (this.storage === 'local') {
      const file = await this.copyObjectLocal(
        sourceFileId,
        destinationFileName,
      );
      return file;
    }

    if (this.storage === 's3') {
      const file = await this.copyObjectS3(sourceFileId, destinationFileName);
      return file;
    }

    throw new AppError(`${this.storage} is unknown storage type`);
  }

  private async deleteLocalObject(fileId: string): Promise<void> {
    try {
      const filePath = path.join(this.outputPath, fileId);

      if (!fs.existsSync(filePath)) return;

      await fs.promises.unlink(filePath);

      const thumbnailFilePath = path.join(
        this.outputPath,
        this.generateThumbnailName(fileId),
      );

      if (!fs.existsSync(thumbnailFilePath)) return;

      await fs.promises.unlink(thumbnailFilePath);
    } catch (error) {
      log.error(error);
    }
  }

  private async deleteS3Object(fileId: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileId,
    });

    await this.s3.send(command);

    command.input.Key = this.generateThumbnailName(fileId);

    await this.s3.send(command);
  }

  public async deleteObject(fileId: string): Promise<void> {
    if (this.storage === 'local') {
      return this.deleteLocalObject(fileId);
    }

    if (this.storage === 's3') {
      return this.deleteS3Object(fileId);
    }

    throw new AppError(`${this.storage} is unknown storage type`);
  }

  private async renameLocalObject(
    fileId: string,
    newFileId: string,
  ): Promise<StorageObject> {
    const mimeType = mime.lookup(fileId);

    await fs.promises.rename(
      path.join(this.outputPath, fileId),
      path.join(this.outputPath, newFileId),
    );

    if (mimeType && mimeType?.startsWith('image')) {
      await fs.promises.rename(
        path.join(this.outputPath, this.generateThumbnailName(fileId)),
        path.join(this.outputPath, this.generateThumbnailName(newFileId)),
      );
    }

    return this.getObject(newFileId);
  }

  private async renameS3Object(
    fileId: string,
    newFileId: string,
  ): Promise<StorageObject> {
    const mimeType = mime.lookup(fileId);

    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: newFileId,
      CopySource: this.getObject(fileId).url,
      ContentType: mimeType || undefined,
    });

    await this.s3.send(command);

    const isImage = StringUtils.isImage(fileId);

    if (isImage) {
      command.input.Key = this.generateThumbnailName(newFileId);
      command.input.CopySource = this.getS3Object(fileId).thumbnail!;
      await this.s3.send(command);
    }

    this.deleteS3Object(fileId);

    return this.getS3Object(newFileId);
  }

  public async renameObject(
    fileId: string,
    newFilename: string,
  ): Promise<StorageObject> {
    const [id] = fileId.split('_');
    const newFileId = `${id}_${newFilename}`;

    if (fileId === newFileId) {
      throw new AppError('new name must be differ older name');
    }

    if (this.storage === 'local') {
      return this.renameLocalObject(fileId, newFileId);
    }

    if (this.storage === 's3') {
      return this.renameS3Object(fileId, newFileId);
    }

    throw new AppError(`${this.storage} is unknown storage type`);
  }

  public async generateThumbnail(
    image: Buffer,
    options?: { width?: number; height?: number },
  ): Promise<Buffer> {
    const thumb = await sharp(image, { failOn: 'error' })
      .resize(options?.width || 100, options?.height || 100)
      .toBuffer();
    return thumb;
  }

  private generateThumbnailName(fileId: string, thumbnailSuffix = '_thumb') {
    const lastDotIndex = fileId?.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return fileId + thumbnailSuffix;
    }

    const name = fileId?.slice(0, lastDotIndex);
    const extension = fileId?.slice(lastDotIndex);
    return name + thumbnailSuffix + extension;
  }
}

export default Storage;
