export interface CreditCard {
  id?: string;
  user_id?: string;
  name: string;
  annualFee: number;
  minSpend: number;
  minSpendPeriod: number;
  welcomeBonus: number;
  rewardRate: number;
  rewardMultiplier: number;
  pointValue: number;
  created_at?: string;
  updated_at?: string;
  // New fields for special cases
  specialCategories?: SpecialCategory[];
  bonusTiers?: BonusTier[];
  partnerBonuses?: PartnerBonus[];
}

export interface SpecialCategory {
  category: string;
  rewardRate: number;
  maxSpend?: number;
  minSpend?: number;
}

export interface BonusTier {
  minSpend: number;
  maxSpend: number;
  pointValue: number;
}

export interface PartnerBonus {
  partnerName: string;
  bonusRate: number;
  description: string;
}

export interface OptimizationResult {
  card: CreditCard;
  spendAmount: number;
  pointsEarned: number;
  welcomeBonusValue: number;
  rewardsValue: number;
  netBenefit: number;
  specialBonuses?: {
    category?: string;
    partnerName?: string;
    additionalPoints?: number;
    additionalValue?: number;
    description?: string;
  }[];
}

export interface CardFormData {
  name: string;
  annualFee: number;
  minSpend: number;
  minSpendPeriod: number;
  welcomeBonus: number;
  rewardRate: number;
  rewardMultiplier: number;
  pointValue: number;
  specialCategories?: SpecialCategory[];
  bonusTiers?: BonusTier[];
  partnerBonuses?: PartnerBonus[];
}