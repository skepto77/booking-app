import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/decorators/user.decorator';
import { Role } from 'src/users/users.interface';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/sendMessage.dto';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('Socket Init');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToChat')
  @Roles(Role.Client, Role.Manager)
  async getChatHistory(
    @MessageBody() supportRequestId: string,
    @User('id') userId,
  ) {
    const request = await this.chatService.getMessages(
      supportRequestId,
      userId,
    );
    this.server.emit('subscribeToChat', request);
  }

  @SubscribeMessage('sendMessage')
  @Roles(Role.Client, Role.Manager)
  async sendMessage(@MessageBody() data: SendMessageDto, @User('id') author) {
    const { supportRequest, text } = data;
    const res = this.chatService.sendMessage({
      author,
      supportRequest,
      text,
    });
    this.server.emit('sendMessage', res);
  }
}
