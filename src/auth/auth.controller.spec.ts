import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'test123@',
      };
      const result = { access_token: 'test-token' };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await authController.login(loginDto)).toBe(result);
    });
  });

  describe('register', () => {
    it('should return a success message', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'test123@',
      };
      const result = { message: 'User registered successfully' };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      expect(await authController.register(registerDto)).toBe(result);
    });
  });
});
