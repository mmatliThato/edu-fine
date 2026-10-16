
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema.js';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // ==========================================
  // LEVEL 1: SAVE SAVINGS PROGRESS
  // ==========================================

  async saveSavingsProgress(
    userId: string,
    answers: number[],
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const correctAnswers = [1, 2, 0, 2, 1];

    if (
      !Array.isArray(answers) ||
      answers.length !== correctAnswers.length ||
      answers.some(
        (answer) =>
          !Number.isInteger(answer) ||
          answer < 0 ||
          answer > 3,
      )
    ) {
      throw new BadRequestException(
        'Please submit exactly five valid answers',
      );
    }

    const correctCount = answers.reduce(
      (count, answer, index) =>
        count + (answer === correctAnswers[index] ? 1 : 0),
      0,
    );

    const score = correctCount * 20;

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          savingsCompleted: true,
        },
        $max: {
          savingsBestScore: score,
        },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Savings progress saved successfully',
      score,
      bestScore: user.savingsBestScore,
      savingsCompleted: user.savingsCompleted,
    };
  }

  // ==========================================
  // LEVEL 2: SAVE LOANS PUZZLE PROGRESS
  // ==========================================

  async saveLoansProgress(
    userId: string,
    tileOrder: number[],
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Validate that all eight tiles are present exactly once
    const validOrder = [1, 2, 3, 4, 5, 6, 7, 8];

    if (
      !Array.isArray(tileOrder) ||
      tileOrder.length !== 8 ||
      new Set(tileOrder).size !== 8 ||
      tileOrder.some(
        (id) =>
          !Number.isInteger(id) ||
          id < 1 ||
          id > 8,
      )
    ) {
      throw new BadRequestException(
        'Invalid puzzle arrangement',
      );
    }

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.savingsCompleted) {
      throw new BadRequestException(
        'Complete Savings before playing Loans',
      );
    }

    // Calculate score on the backend
    const correctCount = tileOrder.filter(
      (id, index) => id === validOrder[index],
    ).length;

    const score = Math.round((correctCount / 8) * 100);

    // VAT unlocks when the learner solves the puzzle
    const loansCompleted =
      Boolean(user.loansCompleted) || score === 100;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          loansCompleted,
        },
        $max: {
          loansBestScore: score,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Loans progress saved successfully',
      score,
      bestScore: updatedUser.loansBestScore,
      loansCompleted: updatedUser.loansCompleted,
      vatUnlocked: updatedUser.loansCompleted,
    };
  }

  // ==========================================
  // GET LOGGED-IN LEARNER'S PROGRESS
  // ==========================================

  async getMyProgress(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(userId)
      .select(
        'name email savingsCompleted savingsBestScore loansCompleted loansBestScore',
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const savingsCompleted =
      user.savingsCompleted ?? false;

    const savingsBestScore =
      user.savingsBestScore ?? 0;

    const loansCompleted =
      user.loansCompleted ?? false;

    const loansBestScore =
      user.loansBestScore ?? 0;

    const totalLevels = 3;

    // Count completed levels
    const completedLevels =
      Number(savingsCompleted) +
      Number(loansCompleted);

    // Add best scores from completed games
    const totalPoints =
      savingsBestScore + loansBestScore;

    const overallProgress = Math.round(
      (completedLevels / totalLevels) * 100,
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },

      totalPoints,
      completedLevels,
      totalLevels,
      overallProgress,

      levels: {
        savings: {
          completed: savingsCompleted,
          bestScore: savingsBestScore,
          unlocked: true,
        },

        loans: {
          completed: loansCompleted,
          bestScore: loansBestScore,
          unlocked: savingsCompleted,
        },

        vat: {
          completed: false,
          bestScore: 0,
          unlocked: loansCompleted,
        },
      },
    };
  }


async saveVat(userId: string, score: number) {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new BadRequestException(
      'VAT score must be between 0 and 100',
    );
  }

  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.loansCompleted) {
    throw new ForbiddenException(
      'Complete Loans before playing VAT',
    );
  }

  const updatedUser = await this.userModel.findByIdAndUpdate(
    userId,
    {
      $max: { vatBestScore: score },
      $set: { vatCompleted: true },
    },
    { new: true },
  );

  return {
    message: 'VAT progress saved successfully',
    score,
    bestScore: updatedUser!.vatBestScore,
    vatCompleted: updatedUser!.vatCompleted,
  };
}




}

