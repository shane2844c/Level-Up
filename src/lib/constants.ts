import {
  HeartPulse,
  Brain,
  Briefcase,
  BookOpen,
  Wallet,
  Shield,
  Sparkles,
  Dumbbell,
  Target,
  Moon,
  type LucideIcon,
} from "lucide-react";

export interface CategoryIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { id: "heart-pulse", label: "Heart Pulse", icon: HeartPulse },
  { id: "brain", label: "Brain", icon: Brain },
  { id: "briefcase", label: "Briefcase", icon: Briefcase },
  { id: "book-open", label: "Book Open", icon: BookOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "shield", label: "Shield", icon: Shield },
  { id: "sparkles", label: "Sparkles", icon: Sparkles },
  { id: "dumbbell", label: "Dumbbell", icon: Dumbbell },
  { id: "target", label: "Target", icon: Target },
  { id: "moon", label: "Moon", icon: Moon },
];

export const ACCENT_COLORS = [
  "#58C7FF",
  "#65D6A6",
  "#FF7A8A",
  "#F2C66D",
  "#A78BFA",
  "#FB923C",
  "#34D399",
  "#F472B6",
] as const;

export function getCategoryIcon(iconId: string | null | undefined): LucideIcon {
  const found = CATEGORY_ICONS.find((i) => i.id === iconId);
  return found?.icon ?? Target;
}
