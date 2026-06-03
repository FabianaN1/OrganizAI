export type ExperienceTier = 'beginner' | 'intermediate' | 'advanced';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  avatar_key: string;
  substance_target: 'alcohol' | 'tobacco' | 'both';
  goal_type: 'reduce' | 'quit';
  quit_date: string | null;
  motivation: string;
  streak_days: number;
  longest_streak: number;
  last_checkin_date: string | null;
  total_points: number;
  level: number;
  experience_tier: ExperienceTier;
  tribe_id: string | null;
  money_saved: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  module_type: 'quiz' | 'lesson' | 'challenge' | 'reflection';
  substance_tag: 'alcohol' | 'tobacco' | 'both' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes: number;
  points_reward: number;
  content: Record<string, unknown>;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface ModuleCompletion {
  id: string;
  user_id: string;
  module_id: string;
  score: number;
  completed_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  consumed_alcohol: boolean;
  consumed_tobacco: boolean;
  mood: number;
  notes: string;
  cravings_level: number;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition_type: 'streak' | 'modules' | 'checkins' | 'points' | 'special';
  condition_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  substance_focus: 'alcohol' | 'tobacco' | 'both';
  max_members: number;
  is_private: boolean;
  created_by: string | null;
  created_at: string;
  member_count?: number;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  profile?: { full_name: string };
}

export interface IoTDevice {
  id: string;
  user_id: string;
  name: string;
  device_type: 'smartphone' | 'smart_speaker' | 'smart_tv' | 'computer' | 'smartwatch';
  connection_type: 'wifi' | 'bluetooth' | 'mqtt';
  device_token: string;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
}

export interface ReminderSchedule {
  id: string;
  user_id: string;
  device_id: string | null;
  title: string;
  message: string;
  reminder_type: 'checkin' | 'module' | 'hydration' | 'motivation';
  scheduled_time: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  content_type: 'article' | 'video' | 'guide' | 'statistic';
  tags: string[];
  substance_tag: 'alcohol' | 'tobacco' | 'both';
  reading_time_minutes: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  substance_focus: 'alcohol' | 'tobacco' | 'both';
  max_members: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  member_count?: number;
}

export interface TribeMembership {
  id: string;
  tribe_id: string;
  user_id: string;
  role: 'member' | 'elder' | 'mentor';
  joined_at: string;
}

export interface Celebration {
  id: string;
  user_id: string;
  tribe_id: string | null;
  celebration_type: 'level_up' | 'streak' | 'badge' | 'milestone';
  title: string;
  description: string;
  created_at: string;
  profile?: { full_name: string; avatar_key: string };
}

export interface Kudo {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  kudo_type: 'encouragement' | 'congrats' | 'support';
  created_at: string;
  sender_profile?: { full_name: string; avatar_key: string };
}

export interface VirtualGift {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost_points: number;
  is_active: boolean;
}

export interface SentGift {
  id: string;
  sender_id: string;
  receiver_id: string;
  gift_id: string;
  message: string;
  created_at: string;
  gift?: VirtualGift;
  sender_profile?: { full_name: string; avatar_key: string };
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'cosmetic' | 'avatar' | 'title' | 'badge' | 'effect';
  cost_points: number;
  is_available: boolean;
}

export interface RewardPurchase {
  id: string;
  user_id: string;
  item_id: string;
  paid_points: number;
  purchased_at: string;
}

export interface SafePlace {
  id: string;
  name: string;
  description: string;
  place_type: 'cafe' | 'park' | 'museum' | 'library';
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  is_verified: boolean;
  added_by: string | null;
}
