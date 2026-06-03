
/*
  # Extended Gamification Schema — Tribes, Gifts, Celebrations, Rewards, Kudos, Safe Places

  ## New Tables
  1. `tribes` — Thematic communities (up to 50 members) with identity and focus
  2. `tribe_memberships` — User membership in tribes with role (member/elder/mentor)
  3. `celebrations` — Auto-posted milestone celebrations visible on the mural
  4. `kudos` — Quick reactions/encouragement sent between users
  5. `virtual_gifts` — Gift types that can be sent using points
  6. `sent_gifts` — Actual gift transactions between users
  7. `reward_items` — Store items available for purchase with points
  8. `reward_purchases` — Purchase history
  9. `safe_places` — Verified safe meetup locations (cafes, parks, museums)
  10. `user_avatars` — User-chosen avatars for gamified identity

  ## Modified Tables
  - `profiles` — Add columns: tribe_id, avatar_key, experience_tier, money_saved

  ## Security
  - RLS on all new tables
  - Policies enforce ownership and authenticated access
*/

-- ─────────────────────────────────────────────
-- PROFILES: Add new columns
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tribe_id') THEN
    ALTER TABLE profiles ADD COLUMN tribe_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_key') THEN
    ALTER TABLE profiles ADD COLUMN avatar_key text NOT NULL DEFAULT 'default';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience_tier') THEN
    ALTER TABLE profiles ADD COLUMN experience_tier text NOT NULL DEFAULT 'beginner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'money_saved') THEN
    ALTER TABLE profiles ADD COLUMN money_saved numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- TRIBES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'users',
  color text NOT NULL DEFAULT '#10b981',
  substance_focus text NOT NULL DEFAULT 'both',
  max_members integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active tribes"
  ON tribes FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Authenticated users can create tribes"
  ON tribes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- ─────────────────────────────────────────────
-- TRIBE MEMBERSHIPS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tribe_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid NOT NULL REFERENCES tribes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);

ALTER TABLE tribe_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view memberships in their tribe"
  ON tribe_memberships FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM tribe_memberships tm WHERE tm.tribe_id = tribe_memberships.tribe_id AND tm.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own membership"
  ON tribe_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own membership"
  ON tribe_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Mentors can update role in their tribe"
  ON tribe_memberships FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tribe_memberships tm WHERE tm.tribe_id = tribe_memberships.tribe_id AND tm.user_id = auth.uid() AND tm.role = 'mentor'
  ));

-- ─────────────────────────────────────────────
-- CELEBRATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS celebrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tribe_id uuid REFERENCES tribes(id) ON DELETE SET NULL,
  celebration_type text NOT NULL DEFAULT 'level_up',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE celebrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view celebrations"
  ON celebrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own celebrations"
  ON celebrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- KUDOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kudos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL DEFAULT '',
  kudo_type text NOT NULL DEFAULT 'encouragement',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view kudos they sent or received"
  ON kudos FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send kudos"
  ON kudos FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ─────────────────────────────────────────────
-- VIRTUAL GIFTS (catalog)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS virtual_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'gift',
  cost_points integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE virtual_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active gifts"
  ON virtual_gifts FOR SELECT TO authenticated USING (is_active = true);

-- ─────────────────────────────────────────────
-- SENT GIFTS (transactions)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sent_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gift_id uuid NOT NULL REFERENCES virtual_gifts(id) ON DELETE CASCADE,
  message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sent_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view gifts they sent or received"
  ON sent_gifts FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send gifts"
  ON sent_gifts FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ─────────────────────────────────────────────
-- REWARD ITEMS (store catalog)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'shopping-bag',
  category text NOT NULL DEFAULT 'cosmetic',
  cost_points integer NOT NULL DEFAULT 100,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reward_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view available rewards"
  ON reward_items FOR SELECT TO authenticated USING (is_available = true);

-- ─────────────────────────────────────────────
-- REWARD PURCHASES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES reward_items(id) ON DELETE CASCADE,
  paid_points integer NOT NULL DEFAULT 0,
  purchased_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reward_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases"
  ON reward_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases"
  ON reward_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- SAFE PLACES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS safe_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  place_type text NOT NULL DEFAULT 'cafe',
  address text NOT NULL DEFAULT '',
  latitude numeric NOT NULL DEFAULT 0,
  longitude numeric NOT NULL DEFAULT 0,
  city text NOT NULL DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE safe_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view safe places"
  ON safe_places FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can add safe places"
  ON safe_places FOR INSERT TO authenticated WITH CHECK (auth.uid() = added_by);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_user ON tribe_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_tribe ON tribe_memberships(tribe_id);
CREATE INDEX IF NOT EXISTS idx_celebrations_created ON celebrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kudos_receiver ON kudos(receiver_id);
CREATE INDEX IF NOT EXISTS idx_sent_gifts_receiver ON sent_gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reward_purchases_user ON reward_purchases(user_id);
