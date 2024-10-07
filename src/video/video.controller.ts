import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuth, userPayload } from 'src/auth/decorators/jwt-auth.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ListVideosResponseDto } from './dto/list-videos-response.dto';
import { ShareVideoPayloadDto } from './dto/share-video.dto';
import { toVideoResponse } from './mapper/videoResponse.mapper';
import { VideoService } from './video.service';

@ApiTags('videos')
@Controller({ path: 'videos', version: '1.0' })
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Share a Youtube video by video URL' })
  @ApiResponse({ status: 201, description: 'Share video successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async shareVideo(
    @Body() payload: ShareVideoPayloadDto,
    @JwtAuth() user: userPayload,
  ): Promise<any> {
    const userId = user.userId;

    const videoShared = await this.videoService.getVideoByUserIdAndVideoUrl(
      userId,
      payload.videoUrl,
    );

    if (videoShared) {
      throw new BadRequestException({
        message: 'You already shared this video',
      });
    }

    const videoDetails = await this.videoService.getVideoDetails(
      payload.videoUrl,
    );

    await this.videoService.createVideo({
      title: videoDetails.snippet.title,
      description: videoDetails.snippet.description,
      sharedBy: userId,
      videoUrl: payload.videoUrl,
    });

    return { message: 'Video shared successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'List all shared videos' })
  @ApiResponse({
    status: 200,
    description: 'List of shared videos.',
    type: [ListVideosResponseDto],
  })
  async listVideos() {
    const videos = await this.videoService.getListVideos();
    return { videos: videos.map((video) => toVideoResponse(video)) };
  }
}
