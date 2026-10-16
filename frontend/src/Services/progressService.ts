
import api from './api';

export interface SavingsResult {
  message: string;
  score: number;
  bestScore: number;
  savingsCompleted: boolean;
}

export interface LevelProgress {
  completed: boolean;
  bestScore: number;
  unlocked: boolean;
}

export interface UserProgress {
  user: {
    id: string;
    name: string;
    email: string;
  };
  totalPoints: number;
  completedLevels: number;
  totalLevels: number;
  overallProgress: number;
  levels: {
    savings: LevelProgress;
    loans: LevelProgress;
    vat: LevelProgress;
  };
}

const getToken = () => {
  const token = sessionStorage.getItem('accessToken');

  if (!token) {
    throw new Error('You are not logged in');
  }

  return token;
};

export const progressService = {
  saveSavings: async (
    answers: number[],
  ): Promise<SavingsResult> => {
    const response = await api.post<SavingsResult>(
      '/progress/savings',
      { answers },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    return response.data;
  },

  getMyProgress: async (): Promise<UserProgress> => {
    const response = await api.get<UserProgress>(
      '/progress/me',
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    return response.data;
  },



saveLoans: async (tileOrder: number[]) => {
  const token = sessionStorage.getItem('accessToken');

  if (!token) {
    throw new Error('Please log in again.');
  }

  const response = await api.post<{
    message: string;
    score: number;
    bestScore: number;
    loansCompleted: boolean;
    vatUnlocked: boolean;
  }>(
    '/progress/loans',
    { tileOrder },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
},

};
