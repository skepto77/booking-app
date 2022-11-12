import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ID } from 'src/types/common.types';
import { UsersService } from 'src/users/users.service';
import {
  ISupportRequestEmployeeService,
  MarkMessagesAsReadDto,
} from './chat.interface';
import { ChatService } from './chat.service';
import { Message, MessageDocument } from './message.schema';
import {
  SupportRequest,
  SupportRequestDocument,
} from './supportRequest.schema';

@Injectable()
export class ChatEmployeeService implements ISupportRequestEmployeeService {
  constructor(
    @InjectModel(Message.name)
    private readonly messagelModel: Model<MessageDocument>,
    @InjectModel(SupportRequest.name)
    private readonly supportRequestModel: Model<SupportRequestDocument>,
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  async markMessagesAsRead(params: MarkMessagesAsReadDto) {
    const { supportRequest: id } = params;
    const messages = await this.chatService.getMessagesByRequestId(id);

    messages.forEach(async (message: any) => {
      if (!message.readAt) {
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
      if (!msg.readAt && String(msg.author) === String(supportRequest.user)) {
        return msg;
      }
    }).length;
  }

  async closeRequest(id: ID): Promise<void> {
    return await this.supportRequestModel.findByIdAndUpdate(
      { _id: id },
      { isActive: false },
    );
  }

  async buildManagerFindSupportRequests(requests) {
    const res = await Promise.all(
      requests.map(async (request) => {
        const { _id: id, createdAt, isActive, user: clientId } = request;
        const client = await this.usersService.findById(clientId);
        const { name, email, contactPhone } = client;
        const newMessages = await this.getUnreadCount(id);

        return {
          id,
          createdAt,
          isActive,
          hasNewMessages: newMessages > 0,
          client: { id: clientId, name, email, contactPhone },
        };
      }),
    );

    return res;
  }
}
