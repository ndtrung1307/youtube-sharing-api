import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { comparePassword, hashPassword } from './utils/hash.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async login(loginDto: LoginDto) {
    const user = await this.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Unauthorized');
    }

    return { access_token: this.signUserToken(user) };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await hashPassword(registerDto.password);
    const newUser = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);

    return { access_token: this.signUserToken(newUser) };
  }

  private async findByEmail(email: string): Promise<User | null> {
    return (
      await this.userRepository.findBy({
        email: ILike(`%${email}%`),
      })
    )[0];
  }

  private signUserToken(user: User) {
    const payload = { email: user.email, userId: user.id };
    return this.jwtService.sign(payload);
  }
}
