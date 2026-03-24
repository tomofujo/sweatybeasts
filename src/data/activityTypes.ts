import {
  Shield,
  Zap,
  Bike,
  Footprints,
  Waves,
  PersonStanding,
  Ship,
  Mountain,
  Trophy,
  Plus,
  Dumbbell,
  Swords,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityType } from '../types';

export interface ActivityTypeConfig {
  type: ActivityType;
  label: string;
  icon: LucideIcon;
  hasDistance: boolean;
  hasRounds: boolean;
  hasPace: boolean;
  hasIntervals: boolean;
}

export const activityTypeConfigs: ActivityTypeConfig[] = [
  {
    type: 'Hyrox',
    label: 'Hyrox',
    icon: Dumbbell,
    hasDistance: true,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Combat Sports',
    label: 'Combat Sports',
    icon: Swords,
    hasDistance: false,
    hasRounds: true,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Martial Arts',
    label: 'Martial Arts',
    icon: Shield,
    hasDistance: false,
    hasRounds: true,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'HIIT',
    label: 'HIIT',
    icon: Zap,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: true,
  },
  {
    type: 'Cycling',
    label: 'Cycling',
    icon: Bike,
    hasDistance: true,
    hasRounds: false,
    hasPace: true,
    hasIntervals: false,
  },
  {
    type: 'Running',
    label: 'Running',
    icon: Footprints,
    hasDistance: true,
    hasRounds: false,
    hasPace: true,
    hasIntervals: false,
  },
  {
    type: 'Swimming',
    label: 'Swimming',
    icon: Waves,
    hasDistance: true,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Yoga / Pilates',
    label: 'Yoga / Pilates',
    icon: PersonStanding,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Rowing',
    label: 'Rowing',
    icon: Ship,
    hasDistance: true,
    hasRounds: false,
    hasPace: true,
    hasIntervals: false,
  },
  {
    type: 'Climbing',
    label: 'Climbing',
    icon: Mountain,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Football',
    label: 'Football',
    icon: Trophy,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Rugby',
    label: 'Rugby',
    icon: Trophy,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Other Sport',
    label: 'Other Sport',
    icon: Trophy,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
  {
    type: 'Custom',
    label: 'Custom',
    icon: Plus,
    hasDistance: false,
    hasRounds: false,
    hasPace: false,
    hasIntervals: false,
  },
];

export function getActivityConfig(type: ActivityType): ActivityTypeConfig | undefined {
  return activityTypeConfigs.find((c) => c.type === type);
}
