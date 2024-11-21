export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes: string;
};

export type Workout = {
  id: string;
  title: string;
  description: string;
  exercises?: Exercise[];
  created_at: string;
  scheduled_date: string | null;
  completed: boolean;
  completion_date?: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  split_type: 'fullBody' | 'upperLower' | 'custom' | null;
  user_id: string;
  is_rest_day?: boolean;
};