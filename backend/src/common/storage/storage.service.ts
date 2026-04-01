import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('aws.bucketName');
    this.publicBaseUrl = this.normalizeBaseUrl(
      this.configService.getOrThrow<string>('aws.publicBaseUrl'),
    );

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('aws.accessKey'),
        secretAccessKey: this.configService.getOrThrow<string>('aws.secretKey'),
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    this.assertValidImage(file);

    const key = this.buildObjectKey(folder, file.originalname);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `${this.publicBaseUrl}/${key}`;
    } catch {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    if (!files.length) {
      return [];
    }

    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.extractObjectKey(fileUrl);

    if (!key) {
      this.logger.warn(`Skipped deleting unmanaged file URL: ${fileUrl}`);
      return;
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to delete S3 object "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteFiles(fileUrls: string[]): Promise<void> {
    if (!fileUrls.length) {
      return;
    }

    await Promise.all(fileUrls.map((fileUrl) => this.deleteFile(fileUrl)));
  }

  private assertValidImage(file?: Express.Multer.File): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported image format');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Image size must not exceed 5MB');
    }
  }

  private buildObjectKey(folder: string, originalName: string): string {
    const extension = extname(originalName).toLowerCase() || '.jpg';
    const safeFolder = folder.replace(/^\/+|\/+$/g, '');

    return `${safeFolder}/${Date.now()}-${randomUUID()}${extension}`;
  }

  private normalizeBaseUrl(value: string): string {
    return value.replace(/\/+$/, '');
  }

  private extractObjectKey(fileUrl: string): string | null {
    if (!fileUrl.startsWith(`${this.publicBaseUrl}/`)) {
      return null;
    }

    return fileUrl.slice(this.publicBaseUrl.length + 1);
  }
}
