import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { comparePassword, hashPassword } from './utils/hash.utils';

jest.mock('./utils/hash.utils');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw an error if email is already in use', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(new User());

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockReturnValueOnce(new User());
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(new User());
      (hashPassword as jest.Mock).mockResolvedValueOnce('hashedPassword');

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'Registration successful' });
    });
  });

  describe('login', () => {
    it('should throw an error if user is not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = new User();
      user.password = 'hashedPassword';
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a JWT token if login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = new User();
      user._id = new ObjectId();
      user.email = 'test@example.com';
      user.password = 'hashedPassword';
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);
      (jwtService.sign as jest.Mock).mockReturnValueOnce('jwtToken');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'jwtToken' });
    });
  });
});
