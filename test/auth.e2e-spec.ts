import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/auth/auth.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { hashPassword } from 'src/auth/utils/hash.utils';
import { CustomValidationPipe } from 'src/common/pipes/custom-validation.pipe';
import { typeOrmConfigTest } from 'src/config/typeorm.config.test';
import request from 'supertest';
import { Repository } from 'typeorm';

describe('AuthModule (integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot(typeOrmConfigTest),
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new CustomValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.delete({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid email and strong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'Password123@' })
        .expect(201);

      expect(response.body).toEqual({ message: 'Registration successful' });

      const user = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeDefined();
    });

    it('should not register a user with an existing email', async () => {
      await userRepository.save(
        userRepository.create({
          email: 'test@example.com',
          password: 'password',
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'Password123@' })
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });

    it('should not register a user with an invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalidEmail', password: 'Password123@' })
        .expect(400);

      expect(response.body.message).toContain('email is invalid');
    });

    it('should not register a user with an weak email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'weakPassword' })
        .expect(400);

      expect(response.body.message).toContain('password is invalid');
    });
  });

  describe('POST /auth/login', () => {
    it('should login an existing user', async () => {
      const password = 'password';
      const hashedPassword = await hashPassword(password);
      await userRepository.save(
        userRepository.create({
          email: 'test@example.com',
          password: hashedPassword,
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should not login a non-existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password' })
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
