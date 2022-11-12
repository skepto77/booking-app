import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/decorators/user.decorator';
import { Role } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { ChatClientService } from './chat.client.service';
import { ChatEmployeeService } from './chat.employee.service';
import { ChatService } from './chat.service';
import { CreateRequestDto } from './dto/createRequest.dto';

@Controller()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatClientService: ChatClientService,
    private readonly chatEmployeeService: ChatEmployeeService,
    private readonly usersService: UsersService,
  ) {}

  @Post('client/support-requests/')
  @Roles(Role.Client)
  async createSupportRequest(
    @User('id') user,
    @Body() message: CreateRequestDto,
  ) {
    const { text } = message;
    const newRequest: any = await this.chatClientService.createSupportRequest({
      text,
      user,
    });

    return await this.chatClientService.buildCreateSupportRequestResponse(
      newRequest._id,
    );
  }

  @Get('client/support-requests/')
  @Roles(Role.Client)
  async findClientSupportRequests(@User('id') user, @Query() param) {
    const res: any = await this.chatService.findSupportRequests({
      user,
      param,
    });

    return await this.chatClientService.buildClientFindSupportRequests(res);
  }

  @Get('manager/support-requests/')
  @Roles(Role.Manager)
  async findManagerSupportRequests(@Query() param) {
    const res: any = await this.chatService.findSupportRequests({
      user: null,
      param,
    });

    return await this.chatEmployeeService.buildManagerFindSupportRequests(res);
  }

  @Post('common/support-requests/:id/messages')
  @Roles(Role.Client, Role.Manager)
  async sendMessage(
    @Param('id') supportRequest,
    @Body() body: CreateRequestDto,
    @User('id') author,
  ) {
    const { text } = body;
    const message: any = await this.chatService.sendMessage({
      author,
      supportRequest,
      text,
    });

    const { name } = await this.usersService.findById(author);

    const { _id: id, createdAt } = message;
    return { id, createdAt, text, author: { id: author, name } };
  }

  @Get('common/support-requests/:id/messages')
  @Roles(Role.Client, Role.Manager)
  async getMessage(@Param('id') supportRequestId, @User('id') userId) {
    const messages: any = await this.chatService.getMessages(
      supportRequestId,
      userId,
    );

    return await this.chatService.buildGetMessagesRequests(messages);
  }

  @Post('common/support-requests/:id/messages/read')
  @Roles(Role.Client, Role.Manager)
  async markMessagesAsRead(
    @Param('id') supportRequest,
    @Body() body,
    @User('id') user,
    @User('role') role,
  ) {
    const { createdBefore } = body;

    if (role === 'client') {
      return await this.chatClientService.markMessagesAsRead({
        supportRequest,
        user,
        createdBefore,
      });
    }
    return await this.chatEmployeeService.markMessagesAsRead({
      supportRequest,
      user,
      createdBefore,
    });
  }

  //! для теста UnreadCount
  // @Get('common/support-requests/:id')
  // async getUnreadCount(@Param('id') id) {
  //   const count: any = await this.chatClientService.getUnreadCount(id);
  //   return count;
  // }

  //! для теста CloseRequest
  // @Post('common/support-requests/:id')
  // async closeRequest(@Param('id') id) {
  //   const res: any = await this.chatEmployeeService.closeRequest(id);
  //   return res;
  // }
}
