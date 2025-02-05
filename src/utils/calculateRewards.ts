import { CreditCard, OptimizationResult, SpecialCategory, BonusTier, PartnerBonus } from '../types';

function calculateSpecialCategoryValue(
  spendAmount: number,
  category: SpecialCategory,
  basePointValue: number
): { points: number; value: number } {
  let eligibleSpend = spendAmount;
  
  if (category.maxSpend) {
    eligibleSpend = Math.min(eligibleSpend, category.maxSpend);
  }
  
  if (category.minSpend) {
    eligibleSpend = eligibleSpend >= category.minSpend ? eligibleSpend : 0;
  }
  
  const points = eligibleSpend * category.rewardRate;
  const value = points * basePointValue;
  
  return { points, value };
}

function calculateBonusTierValue(
  spendAmount: number,
  tiers: BonusTier[]
): { points: number; value: number } {
  let totalPoints = 0;
  let totalValue = 0;
  
  for (const tier of tiers.sort((a, b) => a.minSpend - b.minSpend)) {
    if (spendAmount >= tier.minSpend) {
      const tierSpend = Math.min(spendAmount, tier.maxSpend) - tier.minSpend;
      const points = tierSpend * tier.pointValue;
      totalPoints += points;
      totalValue += points * tier.pointValue;
    }
  }
  
  return { points: totalPoints, value: totalValue };
}

function calculatePartnerBonusValue(
  spendAmount: number,
  partners: PartnerBonus[],
  basePointValue: number
): { points: number; value: number; partners: string[] } {
  let totalPoints = 0;
  let totalValue = 0;
  const appliedPartners: string[] = [];
  
  for (const partner of partners) {
    const points = spendAmount * partner.bonusRate;
    totalPoints += points;
    totalValue += points * basePointValue;
    appliedPartners.push(partner.partnerName);
  }
  
  return { points: totalPoints, value: totalValue, partners: appliedPartners };
}

export function calculateOptimalStrategy(
  purchaseAmount: number,
  cards: CreditCard[],
  category?: string,
  partnerName?: string
): OptimizationResult[] {
  // Sort cards by potential value per dollar spent
  const sortedCards = [...cards].sort((a, b) => {
    let aValue = ((a.welcomeBonus * a.pointValue) + (a.rewardRate * a.rewardMultiplier * a.pointValue)) / a.minSpend;
    let bValue = ((b.welcomeBonus * b.pointValue) + (b.rewardRate * b.rewardMultiplier * b.pointValue)) / b.minSpend;
    
    // Factor in special categories if applicable
    if (category) {
      const aSpecialCategory = a.specialCategories?.find(c => c.category === category);
      const bSpecialCategory = b.specialCategories?.find(c => c.category === category);
      
      if (aSpecialCategory) {
        aValue += (aSpecialCategory.rewardRate * a.pointValue);
      }
      if (bSpecialCategory) {
        bValue += (bSpecialCategory.rewardRate * b.pointValue);
      }
    }
    
    // Factor in partner bonuses if applicable
    if (partnerName) {
      const aPartnerBonus = a.partnerBonuses?.find(p => p.partnerName === partnerName);
      const bPartnerBonus = b.partnerBonuses?.find(p => p.partnerName === partnerName);
      
      if (aPartnerBonus) {
        aValue += (aPartnerBonus.bonusRate * a.pointValue);
      }
      if (bPartnerBonus) {
        bValue += (bPartnerBonus.bonusRate * b.pointValue);
      }
    }
    
    return bValue - aValue;
  });

  let remainingAmount = purchaseAmount;
  const results: OptimizationResult[] = [];

  // First pass: Allocate spending to cards with special bonuses and welcome bonuses
  for (const card of sortedCards) {
    if (remainingAmount <= 0) break;

    const spendAmount = Math.min(remainingAmount, card.minSpend);
    
    if (spendAmount > 0) {
      const specialBonuses = [];
      let totalPointsEarned = spendAmount * card.rewardRate * card.rewardMultiplier;
      let totalRewardsValue = totalPointsEarned * card.pointValue;
      
      // Calculate special category bonus if applicable
      if (category && card.specialCategories) {
        const specialCategory = card.specialCategories.find(c => c.category === category);
        if (specialCategory) {
          const { points, value } = calculateSpecialCategoryValue(spendAmount, specialCategory, card.pointValue);
          totalPointsEarned += points;
          totalRewardsValue += value;
          specialBonuses.push({
            category,
            additionalPoints: points,
            additionalValue: value,
            description: `${specialCategory.rewardRate}x points in ${category}`
          });
        }
      }
      
      // Calculate partner bonus if applicable
      if (partnerName && card.partnerBonuses) {
        const partnerBonus = card.partnerBonuses.find(p => p.partnerName === partnerName);
        if (partnerBonus) {
          const { points, value } = calculatePartnerBonusValue(spendAmount, [partnerBonus], card.pointValue);
          totalPointsEarned += points;
          totalRewardsValue += value;
          specialBonuses.push({
            partnerName,
            additionalPoints: points,
            additionalValue: value,
            description: partnerBonus.description
          });
        }
      }
      
      // Calculate tiered bonuses if applicable
      if (card.bonusTiers) {
        const { points, value } = calculateBonusTierValue(spendAmount, card.bonusTiers);
        totalPointsEarned += points;
        totalRewardsValue += value;
      }

      const welcomeBonusValue = spendAmount >= card.minSpend ? 
        card.welcomeBonus * card.pointValue : 0;
      const netBenefit = welcomeBonusValue + totalRewardsValue - card.annualFee;

      results.push({
        card,
        spendAmount,
        pointsEarned: totalPointsEarned,
        welcomeBonusValue,
        rewardsValue: totalRewardsValue,
        netBenefit,
        specialBonuses: specialBonuses.length > 0 ? specialBonuses : undefined
      });

      remainingAmount -= spendAmount;
    }
  }

  // Distribute remaining amount to best ongoing rewards cards
  if (remainingAmount > 0 && results.length > 0) {
    const bestCard = results.reduce((best, current) => {
      const currentRate = current.card.rewardRate * current.card.rewardMultiplier * current.card.pointValue;
      const bestRate = best.card.rewardRate * best.card.rewardMultiplier * best.card.pointValue;
      return currentRate > bestRate ? current : best;
    });

    const index = results.findIndex(r => r.card.id === bestCard.card.id);
    if (index !== -1) {
      const additionalPoints = remainingAmount * results[index].card.rewardRate * results[index].card.rewardMultiplier;
      const additionalValue = additionalPoints * results[index].card.pointValue;

      results[index] = {
        ...results[index],
        spendAmount: results[index].spendAmount + remainingAmount,
        pointsEarned: results[index].pointsEarned + additionalPoints,
        rewardsValue: results[index].rewardsValue + additionalValue,
        netBenefit: results[index].netBenefit + additionalValue
      };
    }
  }

  return results;
}