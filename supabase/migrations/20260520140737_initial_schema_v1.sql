
/*
  # Initial Schema — "Sem álcool, sem tabaco — mais saúde" (Part 1)

  Creates core tables without cross-table policy dependencies.
  Tables: profiles, modules, module_completions, daily_checkins,
          badges, user_badges, support_groups, group_memberships,
          group_messages, iot_devices, reminder_schedules,
          content_library, user_points
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  substance_target text NOT NULL DEFAULT 'both',
  goal_type text NOT NULL DEFAULT 'reduce',
  quit_date date,
  motivation text DEFAULT '',
  streak_days integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_checkin_date date,
  total_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- MODULES
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  module_type text NOT NULL DEFAULT 'lesson',
  substance_tag text NOT NULL DEFAULT 'both',
  difficulty text NOT NULL DEFAULT 'easy',
  duration_minutes integer NOT NULL DEFAULT 3,
  points_reward integer NOT NULL DEFAULT 50,
  content jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active modules"
  ON modules FOR SELECT TO authenticated USING (is_active = true);

-- MODULE COMPLETIONS
CREATE TABLE IF NOT EXISTS module_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions"
  ON module_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions"
  ON module_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- DAILY CHECK-INS
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  consumed_alcohol boolean NOT NULL DEFAULT false,
  consumed_tobacco boolean NOT NULL DEFAULT false,
  mood integer NOT NULL DEFAULT 3 CHECK (mood >= 1 AND mood <= 5),
  notes text DEFAULT '',
  cravings_level integer DEFAULT 0 CHECK (cravings_level >= 0 AND cravings_level <= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checkins"
  ON daily_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins"
  ON daily_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins"
  ON daily_checkins FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BADGES
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'award',
  color text NOT NULL DEFAULT '#10b981',
  condition_type text NOT NULL DEFAULT 'streak',
  condition_value integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view badges"
  ON badges FOR SELECT TO authenticated USING (true);

-- USER BADGES
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- SUPPORT GROUPS
CREATE TABLE IF NOT EXISTS support_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  substance_focus text NOT NULL DEFAULT 'both',
  max_members integer NOT NULL DEFAULT 20,
  is_private boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can create groups"
  ON support_groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- GROUP MEMBERSHIPS
CREATE TABLE IF NOT EXISTS group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view group memberships they belong to"
  ON group_memberships FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM group_memberships gm WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own membership"
  ON group_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own membership"
  ON group_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- GROUP MESSAGES
CREATE TABLE IF NOT EXISTS group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view messages"
  ON group_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_memberships WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  ));
CREATE POLICY "Group members can send messages"
  ON group_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM group_memberships WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  ));

-- IOT DEVICES
CREATE TABLE IF NOT EXISTS iot_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  device_type text NOT NULL DEFAULT 'smartphone',
  connection_type text NOT NULL DEFAULT 'wifi',
  device_token text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  last_seen timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices"
  ON iot_devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices"
  ON iot_devices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices"
  ON iot_devices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices"
  ON iot_devices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- REMINDER SCHEDULES
CREATE TABLE IF NOT EXISTS reminder_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id uuid REFERENCES iot_devices(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  reminder_type text NOT NULL DEFAULT 'checkin',
  scheduled_time time NOT NULL,
  days_of_week integer[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reminder_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reminders"
  ON reminder_schedules FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders"
  ON reminder_schedules FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders"
  ON reminder_schedules FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders"
  ON reminder_schedules FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CONTENT LIBRARY
CREATE TABLE IF NOT EXISTS content_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  source_name text NOT NULL DEFAULT '',
  source_url text DEFAULT '',
  content_type text NOT NULL DEFAULT 'article',
  tags text[] NOT NULL DEFAULT '{}',
  substance_tag text NOT NULL DEFAULT 'both',
  reading_time_minutes integer NOT NULL DEFAULT 5,
  is_featured boolean NOT NULL DEFAULT false,
  published_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view content"
  ON content_library FOR SELECT TO authenticated USING (true);

-- USER POINTS LOG
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points"
  ON user_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points"
  ON user_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_module_completions_user ON module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_user ON iot_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_tags ON content_library USING GIN(tags);
