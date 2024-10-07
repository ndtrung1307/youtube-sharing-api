import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { youtubeURLRegex } from 'src/common/regex';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';

interface VideoDetails {
  title: string;
  description: string;
  sharedBy: string;
  videoUrl: string;
}

interface YoutubeVideoDetails {
  snippet: {
    title: string;
    description: string;
  };
}

@Injectable()
export class VideoService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://www.googleapis.com/youtube/v3';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly authService: AuthService,
  ) {
    this.apiKey = this.configService.get<string>('youtube.apiKey');
    this.apiUrl = this.configService.get<string>('youtube.apiV3Url');
  }

  async getVideoByUserIdAndVideoUrl(
    userId: string,
    videoUrl: string,
  ): Promise<Video | null> {
    const user = await this.authService.getUserById(userId);

    return this.videoRepository.findOne({
      where: { sharedBy: user, videoUrl },
    });
  }

  async getVideoDetails(videoURL: string): Promise<YoutubeVideoDetails> {
    const videoId = this.extractVideoId(videoURL);

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const url = `${this.apiUrl}/videos?id=${videoId}&key=${this.apiKey}&part=snippet,contentDetails`;

    try {
      const response = await lastValueFrom(this.httpService.get(url));

      if (response.data.items.length === 0) {
        throw new BadRequestException('Video not found');
      }

      return response.data.items[0];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to fetch video details: ${error.message}`);
    }
  }

  async createVideo(videoDetails: VideoDetails): Promise<Video> {
    const user = await this.authService.getUserById(videoDetails.sharedBy);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const video = new Video();
    video.title = videoDetails.title;
    video.description = videoDetails.description;
    video.videoUrl = videoDetails.videoUrl;
    video.sharedBy = user;

    try {
      return await this.videoRepository.save(video);
    } catch (error) {
      throw new Error(`Failed to save video to database: ${error.message}`);
    }
  }

  async getListVideos(): Promise<Video[]> {
    try {
      return await this.videoRepository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.sharedBy', 'user')
        .orderBy('video.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(youtubeURLRegex);
    return match ? match.pop() : null;
  }
}
