import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import { waitUntil } from '@vercel/functions';
import { S3 } from 'aws-sdk';
import { Observable } from 'rxjs';
import { client } from 'src/grpc/client';
import { CommonDto } from 'src/helper/commonBody.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FileService {
  private s3: S3;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadFile(file: Express.Multer.File, uploadFileDto: CommonDto) {
    try {
        console.log("received");
      
        const { originalname, buffer } = file;
        const timestamp = Date.now()
        const s3Key = `${uploadFileDto.userid}/${timestamp+originalname}`;

        await this.s3
          .putObject({
            Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
            Key: s3Key,
            Body: buffer,
            ContentType: file.mimetype,
          })
          .promise();

        const url = `https://${this.configService.get<string>('AWS_S3_BUCKET')}.s3.${this.configService.get<string>(
          'AWS_REGION',
        )}.amazonaws.com/${s3Key}`;

        const data = await this.userService.storeFileData(
          uploadFileDto.userid,
          url,
          'pending',
          timestamp+originalname,
          file.mimetype,
        );

        waitUntil(new Promise(()=>{
            client.ProcessDocument(
                { file_id: data.id, user_id: data.userId, file_url: data.fileUrl },
                (error: any, response: any) => {
                  if (error) {
                    // return reject(error);
                  }
                  console.log(response);
                  //   resolve(response);
                },
              );
        }));

      return data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while uploading the file',
      );
    }
  }

  async deleteFile(userId: string, fileUrl: string): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET');
      const s3Key = fileUrl.split(
        `${bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/`,
      )[1];

      await this.s3
        .deleteObject({
          Bucket: bucketName,
          Key: s3Key,
        })
        .promise();

      return 'File deleted successfully';
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the file',
      );
    }
  }
}
