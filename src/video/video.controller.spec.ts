import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { ShareVideoPayloadDto } from './dto/share-video.dto';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

const mockVideoService = () => ({
  getVideoByUserIdAndVideoUrl: jest.fn(),
  getVideoDetails: jest.fn(),
  createVideo: jest.fn(),
  getListVideos: jest.fn(),
});

const mockJwtService = {
  verify: jest.fn(),
};

const user = {
  _id: new ObjectId(),
  email: 'email@test.com',
  password: 'password',
  videos: [],
};

const userPayload = {
  userId: user._id.toString(),
  email: user.email,
  iat: 123456,
  exp: 123456,
};

const returnedVideo = {
  _id: new ObjectId(),
  title: 'Test Video',
  description: 'Test Description',
  sharedBy: user,
  videoUrl: 'https://www.youtube.com/watch?v=test',
};

describe('VideoController', () => {
  let controller: VideoController;
  let service: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        { provide: VideoService, useFactory: mockVideoService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shareVideo', () => {
    it('should throw BadRequestException if video is already shared', async () => {
      const payload: ShareVideoPayloadDto = {
        videoUrl: 'https://www.youtube.com/watch?v=test',
      };

      jest
        .spyOn(service, 'getVideoByUserIdAndVideoUrl')
        .mockResolvedValue(returnedVideo);

      await expect(controller.shareVideo(payload, userPayload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should share a video successfully', async () => {
      const payload: ShareVideoPayloadDto = {
        videoUrl: 'https://www.youtube.com/watch?v=IWKeU6YxHno',
      };
      const videoDetails = {
        snippet: {
          title: 'Test Video',
          description: 'Test Description',
        },
      };

      jest
        .spyOn(service, 'getVideoByUserIdAndVideoUrl')
        .mockResolvedValue(null);
      jest.spyOn(service, 'getVideoDetails').mockResolvedValue(videoDetails);
      jest.spyOn(service, 'createVideo').mockResolvedValue(returnedVideo);

      const result = await controller.shareVideo(payload, userPayload);

      expect(service.getVideoByUserIdAndVideoUrl).toHaveBeenCalledWith(
        user._id.toString(),
        payload.videoUrl,
      );
      expect(service.getVideoDetails).toHaveBeenCalledWith(payload.videoUrl);
      expect(service.createVideo).toHaveBeenCalledWith({
        title: videoDetails.snippet.title,
        description: videoDetails.snippet.description,
        sharedBy: user._id.toString(),
        videoUrl: payload.videoUrl,
      });
      expect(result).toEqual({ message: 'Video shared successfully' });
    });
  });

  describe('listVideos', () => {
    it('should return a list of videos', async () => {
      const videos = [returnedVideo];
      jest.spyOn(service, 'getListVideos').mockResolvedValue(videos);

      const result = await controller.listVideos();

      expect(service.getListVideos).toHaveBeenCalled();
      expect(result).toEqual({ videos });
    });
  });
});
