import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import apiConfig from './config/api.config';
import swaggerConfig from './config/swagger.config';
import { typeOrmConfig } from './config/typeorm.config';
import youtubeConfig from './config/youtube.config';
import { NotificationsModule } from './notifications/notifications.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [youtubeConfig, swaggerConfig, apiConfig],
    }),
    AuthModule,
    VideoModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
