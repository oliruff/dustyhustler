import React, { useState, useEffect } from 'react';
import { CreditCardIcon, Calculator, DollarSign, PlusCircle, Trash2 } from 'lucide-react';
import { calculateOptimalStrategy } from './utils/calculateRewards';
import { CardForm } from './components/CardForm';
import { supabase } from './lib/supabase';
import type { CreditCard, OptimizationResult } from './types';

function App() {
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [userCards, setUserCards] = useState<CreditCard[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchUserCards();
    }
  }, [session]);

  const fetchUserCards = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUserCards(data.map(card => ({
        ...card,
        annualFee: card.annual_fee,
        minSpend: card.min_spend,
        minSpendPeriod: card.min_spend_period,
        welcomeBonus: card.welcome_bonus,
        rewardRate: card.reward_rate,
        rewardMultiplier: card.reward_multiplier,
        pointValue: card.point_value,
      })));
    }
  };

  const handleCalculate = () => {
    const amount = parseFloat(purchaseAmount);
    if (!isNaN(amount) && amount > 0 && userCards.length > 0) {
      const optimizedResults = calculateOptimalStrategy(amount, userCards);
      setResults(optimizedResults);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', cardId);

    if (!error) {
      await fetchUserCards();
    }
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email: prompt('Enter your email') || '',
      password: prompt('Enter your password') || '',
    });
  };

  const handleSignUp = async () => {
    const email = prompt('Enter your email');
    const password = prompt('Enter your password');
    
    if (email && password) {
      await supabase.auth.signUp({
        email,
        password,
      });
    }
  };

  const totalNetBenefit = results.reduce((sum, result) => sum + result.netBenefit, 0);
  const totalSpend = results.reduce((sum, result) => sum + result.spendAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <CreditCardIcon className="w-8 h-8" />
            Credit Card Rewards Optimizer
          </h1>
          <p className="text-gray-600">Maximize your rewards by optimizing credit card usage</p>
        </div>

        {!session ? (
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign in to manage your cards</h2>
            <div className="space-x-4">
              <button
                onClick={handleSignIn}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Credit Cards</h2>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Card
                </button>
              </div>

              {userCards.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No cards added yet. Add your first credit card to get started!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-indigo-900">{card.name}</h3>
                        <button
                          onClick={() => card.id && handleDeleteCard(card.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Annual Fee: ${card.annualFee}</p>
                        <p>Reward Rate: {card.rewardRate}x points</p>
                        <p>Welcome Bonus: {card.welcomeBonus.toLocaleString()} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCalculate}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                  disabled={userCards.length === 0}
                >
                  <Calculator className="w-4 h-4" />
                  Calculate
                </button>
              </div>
            </div>

            {results.length > 0 && (
              <div className="bg-white rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Optimal Strategy</h2>
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                        {result.card.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600">Recommended Spend</p>
                          <p className="text-xl font-semibold">${result.spendAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Points Earned</p>
                          <p className="text-xl font-semibold">{Math.round(result.pointsEarned).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Welcome Bonus Value</p>
                          <p className="text-xl font-semibold">${result.welcomeBonusValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Net Benefit</p>
                          <p className="text-xl font-semibold text-green-600">${result.netBenefit.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Annual Fee: ${result.card.annualFee}</p>
                        <p>Minimum Spend: ${result.card.minSpend} in {result.card.minSpendPeriod} days</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Total Purchase Amount</p>
                        <p className="text-2xl font-semibold">${totalSpend.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Net Benefit</p>
                        <p className="text-2xl font-semibold text-green-600">${totalNetBenefit.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAddCard && (
        <CardForm
          onClose={() => setShowAddCard(false)}
          onCardAdded={fetchUserCards}
        />
      )}
    </div>
  );
}

export default App;