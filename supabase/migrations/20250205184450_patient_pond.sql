/*
  # Create credit cards table and policies

  1. New Tables
    - `credit_cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `annual_fee` (numeric)
      - `min_spend` (numeric)
      - `min_spend_period` (integer)
      - `welcome_bonus` (integer)
      - `reward_rate` (numeric)
      - `reward_multiplier` (numeric)
      - `point_value` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `credit_cards` table
    - Add policies for authenticated users to:
      - Read their own cards
      - Create new cards
      - Update their own cards
      - Delete their own cards
*/

CREATE TABLE credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  annual_fee numeric NOT NULL DEFAULT 0,
  min_spend numeric NOT NULL DEFAULT 0,
  min_spend_period integer NOT NULL DEFAULT 90,
  welcome_bonus integer NOT NULL DEFAULT 0,
  reward_rate numeric NOT NULL DEFAULT 1,
  reward_multiplier numeric NOT NULL DEFAULT 1,
  point_value numeric NOT NULL DEFAULT 0.01,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- Policy for reading own cards
CREATE POLICY "Users can read own cards"
  ON credit_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for creating cards
CREATE POLICY "Users can create cards"
  ON credit_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own cards
CREATE POLICY "Users can update own cards"
  ON credit_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting own cards
CREATE POLICY "Users can delete own cards"
  ON credit_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);