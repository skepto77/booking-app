import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  supportRequest: string;

  @IsString()
  text: string;
}
