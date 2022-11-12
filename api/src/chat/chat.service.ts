import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ID } from 'src/types/common.types';
import { UsersService } from 'src/users/users.service';
import { ISupportRequestService, SendMessageDto } from './chat.interface';
import { Message, MessageDocument } from './message.schema';
import {
  SupportRequest,
  SupportRequestDocument,
} from './supportRequest.schema';

@Injectable()
export class ChatService implements ISupportRequestService {
  constructor(
    @InjectModel(Message.name)
    private readonly messagelModel: Model<MessageDocument>,
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
    private readonly usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findSupportRequests({ user, param }): Promise<SupportRequest[]> {
    const { limit = 100, offset = 0, isActive = true } = param;

    const options = user
      ? {
          user,
          isActive,
        }
      : {
          isActive,
        };

    return await this.supportRequestModel
      .find(options)
      .sort('field -createdAt')
      .skip(+offset)
      .limit(+limit)
      .exec();
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const { author, supportRequest: id, text } = data;
    const message = await this.messagelModel.create({ author, text });
    const currentRequest = await this.supportRequestModel.findById(id);

    currentRequest.messages.push(message);
    this.eventEmitter.emit('sendMessage', id, message);
    await currentRequest.save();

    return message;
  }

  async getMessages(requestId: ID, userId: ID): Promise<Message[]> {
    const supportRequest = await this.supportRequestModel.findById(requestId);
    const user = await this.usersService.findById(userId);

    if (user.role === 'client' && String(supportRequest.user) !== userId) {
      throw new HttpException(
        'Вы не являетесь автором обращения',
        HttpStatus.FORBIDDEN,
      );
    }

    return supportRequest.messages;
  }

  async buildGetMessagesRequests(messages) {
    return await Promise.all(
      messages.map(async (messageId) => {
        const message: any = await this.messagelModel.findById(messageId);
        const { _id: id, sentAt, text, readAt, author: authorId } = message;
        const curAuthor = await this.usersService.findById(authorId);
        const { name } = curAuthor;
        return { id, sentAt, text, readAt, author: { id: authorId, name } };
      }),
    );
  }

  subscribe(
    handler: (supportRequest: SupportRequest, message: Message) => void,
  ): () => void {
    throw new Error('Method not implemented.');
  }

  async getMessagesByRequestId(id) {
    const supportRequest = await this.supportRequestModel.findById(id).exec();
    const messages: Message[] = await Promise.all(
      supportRequest.messages.map(
        async (msgId) => await this.messagelModel.findById(msgId),
      ),
    );
    return messages;
  }
}
