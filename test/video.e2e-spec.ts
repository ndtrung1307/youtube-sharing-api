import { HttpModule, HttpService } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { of, throwError } from 'rxjs';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';
import { CustomValidationPipe } from 'src/common/pipes/custom-validation.pipe';
import { typeOrmConfigTest } from 'src/config/typeorm.config.test';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Video } from 'src/video/entities/video.entity';
import { VideoController } from 'src/video/video.controller';
import { VideoService } from 'src/video/video.service';
import request from 'supertest';
import { Repository } from 'typeorm';

const user = new User();
user.email = 'testuser@example.com';
user.password = 'password';

const mockHttpService = {
  get: jest.fn(),
};

const validVideoPayload = {
  videoUrl: 'https://www.youtube.com/watch?v=QgxmcEUDxtA"',
};

describe('VideoModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let videoRepository: Repository<Video>;
  let jwtService: JwtService;
  let httpService: HttpService;
  let token: string;

  async function mockUserAndGenerateToken() {
    const savedUser = await userRepository.save(user);
    token = jwtService.sign({ userId: savedUser.id, email: savedUser.email });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot(typeOrmConfigTest),
        TypeOrmModule.forFeature([User, Video]),
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
        HttpModule,
        NotificationsModule,
      ],
      controllers: [VideoController],
      providers: [
        VideoService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    videoRepository = moduleFixture.get<Repository<Video>>(
      getRepositoryToken(Video),
    );

    jwtService = moduleFixture.get<JwtService>(JwtService);
    httpService = moduleFixture.get<HttpService>(HttpService);

    app.useGlobalPipes(new CustomValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await videoRepository.delete({});
    await userRepository.delete({});
  });

  afterAll(async () => {
    await videoRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/videos (POST)', () => {
    it('should share a video successfully', async () => {
      await mockUserAndGenerateToken();

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

      mockHttpService.get.mockReturnValue(of(youtubeApiResponse));

      const response = await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(validVideoPayload)
        .expect(201);

      expect(response.body).toEqual({ message: 'Video shared successfully' });
    });

    it('should return 400 if video is already shared', async () => {
      await mockUserAndGenerateToken();

      await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(validVideoPayload)
        .expect(201);

      // Try to share the same video again
      const response = await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(validVideoPayload)
        .expect(400);

      expect(response.body.message).toEqual('You already shared this video');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/videos')
        .send(validVideoPayload)
        .expect(401);

      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 if no videoUrl is provided', async () => {
      const payload = {};
      await mockUserAndGenerateToken();

      const response = await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        'videoUrl is invalid. url must be a valid youtube url',
      );
    });

    it('should return 400 if videoUrl is in wrong format', async () => {
      const payload = {
        videoUrl: 'invalid-url',
      };

      await mockUserAndGenerateToken();

      const response = await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual(
        'videoUrl is invalid. url must be a valid youtube url',
      );
    });

    it('should return 400 if video is not found', async () => {
      await mockUserAndGenerateToken();

      mockHttpService.get.mockReturnValue(
        of({
          data: {
            items: [],
          },
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(validVideoPayload)
        .expect(400);

      expect(response.body.message).toEqual('Video not found');
    });

    it('should return 500 if an error occurs while fetching video details', async () => {
      await mockUserAndGenerateToken();
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await request(app.getHttpServer())
        .post('/videos')
        .set('authorization', `Bearer ${token}`)
        .send(validVideoPayload)
        .expect(500);
    });
  });

  describe('/video/list (GET)', () => {
    it('should return a list of videos', async () => {
      const response = await request(app.getHttpServer())
        .get('/videos')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
      expect(Array.isArray(response.body.videos)).toBe(true);
    });
  });
});
