import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import env from './env.util';

class Storage {
  private region: string;

  private bucket: string;

  private s3: S3Client;

  constructor() {
    this.region = env.get<string>('s3.AWS_REGION');
    this.bucket = env.get<string>('s3.AWS_S3_BUCKET');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: env.get('s3.AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('s3.AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  public getFilename(fileUrl: string): string {
    const fileUrlSplitted = fileUrl.split('/');
    const fileName = fileUrlSplitted[fileUrlSplitted.length - 1];
    return fileName;
  }

  public getObject(fileName: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;
  }

  public async uploadObject(
    fileName: string,
    fileData: PutObjectCommandInput['Body'],
    mimeType?: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: fileData,
      ContentType: mimeType,
    });

    await this.s3.send(command);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;
  }

  public async deleteObject(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    });

    await this.s3.send(command);
  }
}

export default Storage;
