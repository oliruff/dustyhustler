/*
  # Fix credit cards RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper user_id handling
    - Ensure insert policy properly sets user_id

  2. Security
    - Maintain RLS on credit_cards table
    - Add improved policies for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own cards" ON credit_cards;
DROP POLICY IF EXISTS "Users can create cards" ON credit_cards;
DROP POLICY IF EXISTS "Users can update own cards" ON credit_cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON credit_cards;

-- Create new policies with proper user_id handling
CREATE POLICY "Users can read own cards"
  ON credit_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create cards"
  ON credit_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON credit_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON credit_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);