import { ApiProperty } from '@nestjs/swagger';
import { IsValidYouTubeUrl } from 'src/common/custom-validator/is-valid-youtube-url.validator';

export class ShareVideoPayloadDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=r9e1QZhs2Vw' })
  @IsValidYouTubeUrl()
  videoUrl: string;
}
