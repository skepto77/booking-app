import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/users.sсhema';
import { ChatClientService } from './chat.client.service';
import { ChatController } from './chat.controller';
import { ChatEmployeeService } from './chat.employee.service';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from './message.schema';
import { SupportRequest, SupportRequestSchema } from './supportRequest.schema';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: SupportRequest.name, schema: SupportRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    ChatClientService,
    ChatEmployeeService,
    UsersService,
  ],
})
export class ChatModule {}
