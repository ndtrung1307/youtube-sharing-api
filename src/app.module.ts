import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import apiConfig from './config/api.config';
import swaggerConfig from './config/swagger.config';
import youtubeConfig from './config/youtube.config';
import { Video } from './video/entities/video.entity';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URI,
      synchronize: true,
      useUnifiedTopology: true,
      entities: [User, Video],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [youtubeConfig, swaggerConfig, apiConfig],
    }),
    AuthModule,
    VideoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
