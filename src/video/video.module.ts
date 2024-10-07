import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Video } from './entities/video.entity';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, User]),
    ConfigModule,
    HttpModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
