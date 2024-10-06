import { ApiProperty } from '@nestjs/swagger';

export class ListVideosResponseDto {
  @ApiProperty({ example: '60f4b3b3b9b3f3b3b3b3b3b3' })
  id: string;

  @ApiProperty({ example: 'Video title' })
  title: string;

  @ApiProperty({ example: 'Video description' })
  description: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=r9e1QZhs2Vw' })
  videoUrl: string;

  @ApiProperty({ example: '2021-07-19T14:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2021-07-19T14:00:00.000Z' })
  updatedAt: Date;
}
