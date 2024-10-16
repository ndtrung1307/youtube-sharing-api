import { HttpService } from '@nestjs/axios';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UUID } from 'mongodb';
import { of } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { VideoService } from './video.service';

const mockVideoRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockHttpService = {
  get: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockAuthService = {
  getUserById: jest.fn(),
};

const mockNotificationsGateway = {
  server: {
    emit: jest.fn(),
  },
};

const userId = new UUID().toString();

const user = new User();
user.id = userId;
user.email = 'user@email.com';
user.password = 'password';

const videos = [
  {
    id: new UUID().toString(),
    title: 'Test Video',
    description: 'Test Description',
    videoUrl: 'https://www.youtube.com/watch?v=test',
    sharedBy: user,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('VideoService', () => {
  let service: VideoService;
  let videoRepository: Repository<Video>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        { provide: getRepositoryToken(Video), useFactory: mockVideoRepository },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationsGateway, useValue: mockNotificationsGateway },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    videoRepository = module.get<Repository<Video>>(getRepositoryToken(Video));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVideo', () => {
    it('should create a new video', async () => {
      const videoDetails = {
        title: 'Test Video',
        description: 'Test Description',
        sharedBy: userId.toString(),
        videoUrl: 'https://www.youtube.com/watch?v=test',
      };

      const returnedVideo = {
        ...videoDetails,
        id: new UUID().toString(),
        sharedBy: user,
      };

      const videoDetailsWithUser = {
        ...videoDetails,
        sharedBy: user,
      };

      jest.spyOn(mockAuthService, 'getUserById').mockResolvedValue(user);
      jest.spyOn(videoRepository, 'save').mockResolvedValue(returnedVideo);

      const result = await service.createVideo(videoDetails);

      expect(videoRepository.save).toHaveBeenCalledWith(videoDetailsWithUser);
      expect(result).toEqual(returnedVideo);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const videoDetails = {
        title: 'Test Video',
        description: 'Test Description',
        sharedBy: userId.toString(),
        videoUrl: 'https://www.youtube.com/watch?v=test',
      };

      jest.spyOn(mockAuthService, 'getUserById').mockResolvedValue(null);

      await expect(service.createVideo(videoDetails)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if saving video fails', async () => {
      const videoDetails = {
        title: 'Test Video',
        description: 'Test Description',
        sharedBy: userId.toString(),
        videoUrl: 'https://www.youtube.com/watch?v=test',
      };

      jest.spyOn(mockAuthService, 'getUserById').mockResolvedValue(user);
      jest
        .spyOn(videoRepository, 'save')
        .mockRejectedValue(new Error('Failed to save video'));

      await expect(service.createVideo(videoDetails)).rejects.toThrow(
        'Failed to save video to database: Failed to save video',
      );
    });
  });

  describe('getVideoByUserIdAndVideoUrl', () => {
    it('should return a video if found', async () => {
      const videoUrl = 'https://www.youtube.com/watch?v=test';
      const video = {
        id: new UUID().toString(),
        videoUrl,
        sharedBy: user,
        title: 'Test Video',
        description: 'Test Description',
      };
      jest.spyOn(mockAuthService, 'getUserById').mockResolvedValue(user);
      jest.spyOn(videoRepository, 'findOne').mockResolvedValue(video);

      const result = await service.getVideoByUserIdAndVideoUrl(
        userId.toString(),
        videoUrl,
      );

      expect(videoRepository.findOne).toHaveBeenCalledWith({
        where: { sharedBy: { id: user.id }, videoUrl },
        relations: ['sharedBy'],
      });
      expect(result).toEqual(video);
    });

    it('should return null if no video is found', async () => {
      const videoUrl = 'https://www.youtube.com/watch?v=test';

      jest.spyOn(mockAuthService, 'getUserById').mockResolvedValue(user);
      jest.spyOn(videoRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getVideoByUserIdAndVideoUrl(
        userId.toString(),
        videoUrl,
      );

      expect(videoRepository.findOne).toHaveBeenCalledWith({
        where: { sharedBy: { id: user.id }, videoUrl },
        relations: ['sharedBy'],
      });
      expect(result).toBeNull();
    });
  });

  describe('getVideoDetails', () => {
    it('should return video details from YouTube API', async () => {
      const videoUrl = 'https://www.youtube.com/watch?v=IWKeU6YxHno';
      const apiKey = 'apiKey';
      const youtubeApiResponse = {
        data: {
          items: [
            {
              snippet: {
                title: 'Test Video',
                description: 'Test Description',
              },
            },
          ],
        },
      };

      mockConfigService.get.mockReturnValue(apiKey);
      mockHttpService.get.mockReturnValue(of(youtubeApiResponse));

      const result = await service.getVideoDetails(videoUrl);
      expect(result).toEqual(youtubeApiResponse.data.items[0]);
    });

    it('should throw an error if YouTube API request fails by wrong type video ID', async () => {
      const videoUrl = 'https://www.youtube.com/watch?v=test';
      const apiKey = 'apiKey';

      mockConfigService.get.mockReturnValue(apiKey);
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            items: [],
          },
        }),
      );

      await expect(service.getVideoDetails(videoUrl)).rejects.toThrow(
        'Invalid YouTube URL',
      );
    });

    it('should throw an error if YouTube API request fails by not existed video ID', async () => {
      const videoUrl = 'https://www.youtube.com/watch?v=IWKeU6YxHno';
      const apiKey = 'apiKey';

      mockConfigService.get.mockReturnValue(apiKey);
      mockHttpService.get.mockReturnValue(
        of({
          data: {
            items: [],
          },
        }),
      );

      await expect(service.getVideoDetails(videoUrl)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getListVideos', () => {
    it('should return a list of videos', async () => {
      jest.spyOn(videoRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(videos),
      } as any);

      const result = await service.getListVideos();

      expect(videoRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(videos);
    });

    it('should return error when something went wrong with database query', async () => {
      jest.spyOn(videoRepository, 'find').mockRejectedValue(new Error());

      try {
        await service.getListVideos();
      } catch (error) {
        expect(error.message).toContain('Failed to fetch videos');
      }
    });
  });
});
