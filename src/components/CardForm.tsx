import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import type { CardFormData } from '../types';
import { supabase } from '../lib/supabase';

interface CardFormProps {
  onClose: () => void;
  onCardAdded: () => void;
}

export function CardForm({ onClose, onCardAdded }: CardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    annualFee: 0,
    minSpend: 0,
    minSpendPeriod: 90,
    welcomeBonus: 0,
    rewardRate: 1,
    rewardMultiplier: 1,
    pointValue: 0.01,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('credit_cards')
      .insert([{
        user_id: user.id,
        name: formData.name,
        annual_fee: formData.annualFee,
        min_spend: formData.minSpend,
        min_spend_period: formData.minSpendPeriod,
        welcome_bonus: formData.welcomeBonus,
        reward_rate: formData.rewardRate,
        reward_multiplier: formData.rewardMultiplier,
        point_value: formData.pointValue,
      }]);

    if (!error) {
      onCardAdded();
      onClose();
    } else {
      console.error('Error adding card:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Credit Card</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Fee
              </label>
              <input
                type="number"
                value={formData.annualFee}
                onChange={(e) => setFormData({ ...formData, annualFee: parseFloat(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Spend
              </label>
              <input
                type="number"
                value={formData.minSpend}
                onChange={(e) => setFormData({ ...formData, minSpend: parseFloat(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spend Period (days)
              </label>
              <input
                type="number"
                value={formData.minSpendPeriod}
                onChange={(e) => setFormData({ ...formData, minSpendPeriod: parseInt(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Bonus (points)
              </label>
              <input
                type="number"
                value={formData.welcomeBonus}
                onChange={(e) => setFormData({ ...formData, welcomeBonus: parseInt(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Rate (points per dollar)
              </label>
              <input
                type="number"
                value={formData.rewardRate}
                onChange={(e) => setFormData({ ...formData, rewardRate: parseFloat(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Multiplier
              </label>
              <input
                type="number"
                value={formData.rewardMultiplier}
                onChange={(e) => setFormData({ ...formData, rewardMultiplier: parseFloat(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Point Value (in dollars)
              </label>
              <input
                type="number"
                value={formData.pointValue}
                onChange={(e) => setFormData({ ...formData, pointValue: parseFloat(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                step="0.001"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}