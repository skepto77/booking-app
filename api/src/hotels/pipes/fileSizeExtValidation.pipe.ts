import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // console.log('value FileSizeValidationPipe', value);
    const fileSize = 2500000; // 2500Kb

    return value.map((value: Express.Multer.File) => {
      const ext = extname(value.originalname).toLocaleLowerCase();

      if (value.size > fileSize) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errorMessage: 'FILE_SIZE_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errorMessage: 'FILE_TYPE_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        return value;
      }
    });
  }
}
