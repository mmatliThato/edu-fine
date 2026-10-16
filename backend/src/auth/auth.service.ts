
import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';




@Injectable()
export class AuthService {
  constructor(
  private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the email is already registered
    const existingUser =
      await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // Create user in MongoDB
      const user = await this.usersService.create(
        name.trim(),
        normalizedEmail,
        hashedPassword,
      );

      // Never return the password hash
      return {
        message: 'Registration successful',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          totalScore: user.totalScore,
        },
      };
    } catch (error: unknown) {
      // MongoDB duplicate key error (race condition)
      if (
        error !== null &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('Email already registered');
      }

      throw error;
    }
  }




async login(loginDto: LoginDto) {
  const { email, password } = loginDto;

  const user = await this.usersService.findByEmail(email);

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const accessToken = await this.jwtService.signAsync({
    sub: user._id.toString(),
    email: user.email,
  });

  return {
    message: 'Login successful',
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      totalScore: user.totalScore,
    },
  };
}

}
