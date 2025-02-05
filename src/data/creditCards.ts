import { CreditCard } from '../types';

export const creditCards: CreditCard[] = [
  {
    name: 'Chase Sapphire Reserve',
    annualFee: 550,
    minSpend: 4000,
    minSpendPeriod: 90,
    welcomeBonus: 60000,
    rewardRate: 3,
    rewardMultiplier: 1,
    pointValue: 0.0205,
  },
  {
    name: 'Capital One Venture X',
    annualFee: 395,
    minSpend: 4000,
    minSpendPeriod: 90,
    welcomeBonus: 75000,
    rewardRate: 2,
    rewardMultiplier: 1,
    pointValue: 0.018,
  },
  {
    name: 'American Express Green',
    annualFee: 150,
    minSpend: 3000,
    minSpendPeriod: 90,
    welcomeBonus: 40000,
    rewardRate: 3,
    rewardMultiplier: 1,
    pointValue: 0.02,
  },
];