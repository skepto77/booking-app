import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const fileSize = 2500000; // 2500Kb

    return value.map((value: Express.Multer.File) => {
      if (value.size > fileSize) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            errorMessage: 'FILE_SIZE_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else if (!value.mimetype.includes('image')) {
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

/* 
Validate the file extension
import { extname } from 'path';
console.log('value FileSizeValidationPipe', value);
const ext = extname(value.originalname).toLocaleLowerCase();
else if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg')
*/
