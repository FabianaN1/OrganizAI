/*
  # Create user interactions table

  1. New Tables
    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `target_user_id` (uuid, foreign key to auth.users)
      - `interaction_type` (text: 'like', 'celebrate', 'support')
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_interactions` table
    - Add policy for authenticated users to insert their own interactions
    - Add policy for authenticated users to read interactions they're involved in
    - Add policy for authenticated users to delete their own interactions
*/

CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'celebrate', 'support')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_interaction CHECK (user_id != target_user_id),
  CONSTRAINT unique_interaction UNIQUE(user_id, target_user_id, interaction_type)
);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own interactions"
  ON user_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their interactions"
  ON user_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can delete own interactions"
  ON user_interactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_interactions_target ON user_interactions(target_user_id);
CREATE INDEX idx_user_interactions_created ON user_interactions(created_at DESC);
