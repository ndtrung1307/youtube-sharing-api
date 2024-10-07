import { ListVideosResponseDto } from '../dto/list-videos-response.dto';
import { Video } from '../entities/video.entity';

export function toVideoResponse(video: Video): ListVideosResponseDto {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    sharedBy: video.sharedBy.email,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}
