import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ID } from 'src/types/common.types';
import {
  CreateSupportRequestDto,
  ISupportRequestClientService,
  MarkMessagesAsReadDto,
} from './chat.interface';
import { ChatService } from './chat.service';
import { Message, MessageDocument } from './message.schema';
import {
  SupportRequest,
  SupportRequestDocument,
} from './supportRequest.schema';

@Injectable()
export class ChatClientService implements ISupportRequestClientService {
  constructor(
    @InjectModel(Message.name)
    private readonly messagelModel: Model<MessageDocument>,
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
    private readonly chatService: ChatService,
  ) {}

  async createSupportRequest(
    data: CreateSupportRequestDto,
  ): Promise<SupportRequest> {
    const { user, text } = data;

    const message = await this.messagelModel.create({
      author: user,
      text,
    });

    return await this.supportRequestModel.create({
      user,
      messages: [message],
    });
  }

  async buildCreateSupportRequestResponse(id) {
    return await this.supportRequestModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $addFields: { hasNewMessages: false } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          createdAt: 1,
          isActive: 1,
          hasNewMessages: 1,
        },
      },
    ]);
  }

  async markMessagesAsRead(params: MarkMessagesAsReadDto) {
    const { supportRequest: id, user } = params;
    const supportRequest = await this.supportRequestModel.findById(id).exec();

    if (!supportRequest) {
      throw new HttpException('Req not found', HttpStatus.NOT_FOUND);
    }

    if (String(supportRequest.user) !== user) {
      throw new HttpException(
        'Вы не являетесь автором обращения',
        HttpStatus.FORBIDDEN,
      );
    }

    const messages = await this.chatService.getMessagesByRequestId(id);

    messages.forEach(async (message: any) => {
      if (!message.readAt && String(message.author) !== user) {
        message.readAt = new Date();
        await this.messagelModel.findByIdAndUpdate(message._id, {
          readAt: new Date(),
        });
      }
    });

    return { success: true };
  }

  async getUnreadCount(id: ID): Promise<number> {
    const supportRequest = await this.supportRequestModel.findById(id).exec();
    const messages = await this.chatService.getMessagesByRequestId(id);

    return messages.filter((msg) => {
      if (!msg.readAt && String(msg.author) !== String(supportRequest.user)) {
        return msg;
      }
    }).length;
  }

  async buildClientFindSupportRequests(requests) {
    const res = await Promise.all(
      requests.map(async (request) => {
        const { _id: id, createdAt, isActive } = request;
        const newMessages = await this.getUnreadCount(id);
        console.log('newMessages', newMessages);
        return { id, createdAt, isActive, hasNewMessages: newMessages > 0 };
      }),
    );

    return res;
  }
}
