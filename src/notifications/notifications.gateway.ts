import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('NotificationsGateway');
  constructor(private readonly jwtService: JwtService) {}
  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected ' + client.id);
    const authHeader = client.handshake.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        client.data = decoded;
      } catch (error) {
        console.log(error);

        client.emit('error', {
          message: 'Unauthorized',
        });
        client.disconnect();
      }
    } else {
      client.emit('error', {
        message: 'Unauthorized',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('newVideo')
  handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    this.server.emit('newVideo', data);
  }
}
