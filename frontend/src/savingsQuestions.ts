
export interface Question {
  id: number;
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const savingsQuestions: Question[] = [
  {
    id: 1,
    scenario:
      'Your grandmother gives you R500 for your birthday.',
    question:
      'What is the smartest way to use this money if you want to buy a bicycle?',
    options: [
      'Spend all R500 on snacks',
      'Save R400 and spend R100',
      'Give all the money to a friend',
      'Buy something you do not need',
    ],
    correctAnswer: 1,
    explanation:
      'Saving most of your money helps you reach your financial goals faster.',
  },
  {
    id: 2,
    scenario:
      'You receive R200 pocket money every month.',
    question:
      'If you save R50 every month, how much will you have after 6 months?',
    options: ['R200', 'R250', 'R300', 'R400'],
    correctAnswer: 2,
    explanation:
      'R50 multiplied by 6 months equals R300.',
  },
  {
    id: 3,
    scenario:
      'You want new headphones that cost R600.',
    question:
      'Which action will help you afford them?',
    options: [
      'Save some money every month',
      'Borrow money without a repayment plan',
      'Spend all your pocket money',
      'Ignore your budget',
    ],
    correctAnswer: 0,
    explanation:
      'Regular saving makes it easier to afford something you want.',
  },
  {
    id: 4,
    scenario:
      'You have R100 saved, but you see a toy you like.',
    question:
      'What should you do before buying it?',
    options: [
      'Buy it immediately',
      'Spend all your savings',
      'Check whether it fits your budget',
      'Borrow more money',
    ],
    correctAnswer: 2,
    explanation:
      'A budget helps you decide whether you can afford something.',
  },
  {
    id: 5,
    scenario:
      'You want to save R1,200 in 12 months.',
    question:
      'How much must you save each month?',
    options: ['R50', 'R100', 'R150', 'R200'],
    correctAnswer: 1,
    explanation:
      'R1,200 divided by 12 months equals R100 per month.',
  },
];
