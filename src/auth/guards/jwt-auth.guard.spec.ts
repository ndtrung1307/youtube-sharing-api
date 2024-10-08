import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    reflector = new Reflector();
    jwtAuthGuard = new JwtAuthGuard(reflector, jwtService);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  it('should allow access when token is valid', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jest
      .spyOn(jwtService, 'verify')
      .mockReturnValue({ userId: 'test-user-id' });

    const result = jwtAuthGuard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no authorization header is present', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => jwtAuthGuard.canActivate(mockExecutionContext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is missing', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer ',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => jwtAuthGuard.canActivate(mockExecutionContext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is invalid', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => jwtAuthGuard.canActivate(mockExecutionContext)).toThrow(
      UnauthorizedException,
    );
  });
});
