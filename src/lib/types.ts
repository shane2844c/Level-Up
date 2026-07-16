import type { LevelProgress } from "@/lib/levels";

export type HabitType = "good" | "bad";

export type TransactionType =
  | "good_habit"
  | "bad_habit"
  | "reward_redemption"
  | "manual_adjustment";

export interface Profile {
  id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  accent_color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  habit_type: HabitType;
  xp_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  habit_id: string | null;
  reward_id: string | null;
  transaction_type: TransactionType;
  description: string;
  bank_xp_change: number;
  category_xp_change: number;
  created_at: string;
  category?: Category | null;
  habit?: Habit | null;
  reward?: Reward | null;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  xp_cost: number;
  transaction_id: string;
  redeemed_at: string;
  reward?: Reward;
}

export interface XpSummary {
  currentBalance: number;
  totalEarned: number;
  totalLost: number;
  totalSpent: number;
}

export interface CategorySummary {
  category: Category;
  totalCategoryXp: number;
  goodHabitCount: number;
  habitCount: number;
}

export interface CategoryLevelEvent {
  id: string;
  user_id: string;
  category_id: string;
  level: number;
  transaction_id: string;
  reached_at: string;
  category?: Category;
}

export interface ExpandedCategoryProgress {
  category: Category;
  totalCategoryXp: number;
  weekXp: number;
  goodCompletions: number;
  topHabit: { name: string; xp: number } | null;
  activeHabitCount: number;
}

export interface ProgressOverviewStats {
  lifetimeCategoryXp: number;
  weekCategoryXp: number;
  totalLevelsGained: number;
  strongestCategory: { category: Category; xp: number } | null;
}

export interface CategoryXpShare {
  category: Category;
  xp: number;
  percentage: number;
}

export interface HabitContribution {
  habitId: string;
  habitName: string;
  categoryName: string;
  categoryId: string;
  completions: number;
  totalXp: number;
}

export interface ChartDataPoint {
  date: string;
  categoryId: string;
  xp: number;
}

export interface UpcomingMilestone {
  category: Category;
  currentLevel: number;
  nextLevel: number;
  xpRemaining: number;
  progressPercent: number;
  totalXp: number;
}

export interface CategoryDetailStats {
  category: Category;
  totalCategoryXp: number;
  weekXp: number;
  monthXp: number;
  goodCompletions: number;
  badOccurrences: number;
  activeHabitCount: number;
  levelProgress: LevelProgress;
}

export interface LogHabitResult {
  transaction: XpTransaction;
  bank_balance: number;
  level_ups?: number[];
  category_xp_before?: number;
}

export interface RedeemRewardResult {
  redemption: RewardRedemption;
  transaction: XpTransaction;
  bank_balance: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          accent_color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          accent_color?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      habits: {
        Row: Habit;
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          habit_type: HabitType;
          xp_amount: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          habit_type?: HabitType;
          xp_amount?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      rewards: {
        Row: Reward;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          xp_cost: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          xp_cost?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      xp_transactions: {
        Row: XpTransaction;
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          habit_id?: string | null;
          reward_id?: string | null;
          transaction_type: TransactionType;
          description: string;
          bank_xp_change: number;
          category_xp_change?: number;
          created_at?: string;
        };
        Update: {
          description?: string;
        };
      };
      reward_redemptions: {
        Row: RewardRedemption;
        Insert: {
          id?: string;
          user_id: string;
          reward_id: string;
          xp_cost: number;
          transaction_id: string;
          redeemed_at?: string;
        };
        Update: {
          redeemed_at?: string;
        };
      };
      category_level_events: {
        Row: CategoryLevelEvent;
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          level: number;
          transaction_id: string;
          reached_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      log_habit: {
        Args: { p_habit_id: string };
        Returns: LogHabitResult;
      };
      redeem_reward: {
        Args: { p_reward_id: string };
        Returns: RedeemRewardResult;
      };
      get_bank_balance: {
        Args: { p_user_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
