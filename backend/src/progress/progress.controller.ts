
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { ProgressService } from './progress.service.js';
import { SubmitAnswersDto } from '../auth/dto/submit-answers.dto.js';
import { SubmitLoansDto } from '../auth/dto/submit-loans.dto.js';
import { SaveVatDto } from '../auth/dto/save-vat.dto.js';

// --------------------------------------
// AUTHENTICATED REQUEST TYPE
// --------------------------------------
type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

// --------------------------------------
// JWT AUTHENTICATION GUARD
// --------------------------------------
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing authentication token',
      );
    }

    const token = authorization.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token);

      if (!payload?.sub) {
        throw new UnauthorizedException(
          'Invalid token payload',
        );
      }

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired token',
      );
    }
  }
}

// --------------------------------------
// PROGRESS CONTROLLER
// --------------------------------------
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
  ) {}

  // --------------------------------------
  // LEVEL 1: SAVINGS
  // POST /progress/savings
  // --------------------------------------
  @Post('savings')
  saveSavings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitAnswersDto,
  ) {
    return this.progressService.saveSavingsProgress(
      req.user.sub,
      dto.answers,
    );
  }

  // --------------------------------------
  // LEVEL 2: LOANS
  // POST /progress/loans
  // --------------------------------------
  @Post('loans')
  saveLoans(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitLoansDto,
  ) {
    return this.progressService.saveLoansProgress(
      req.user.sub,
      dto.tileOrder,
    );
  }

  // --------------------------------------
  // LEVEL 3: VAT
  // POST /progress/vat
  // --------------------------------------
  @Post('vat')
  saveVat(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveVatDto,
  ) {
    return this.progressService.saveVat(
      req.user.sub,
      dto.score,
    );
  }

  // --------------------------------------
  // GET LOGGED-IN LEARNER PROGRESS
  // GET /progress/me
  // --------------------------------------
  @Get('me')
  getMyProgress(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.progressService.getMyProgress(
      req.user.sub,
    );
  }
}
