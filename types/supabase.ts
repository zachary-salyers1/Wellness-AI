export type Workout = {
  id: string;
  title: string;
  description: string | null;
  exercises: Exercise[];
  date: string;
  scheduled_date: string | null;
  completed: boolean;
  type: 'strength' | 'cardio' | 'flexibility' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  split_type: 'fullBody' | 'upperLower' | 'custom' | null;
  user_id: string;
  created_at: string;
}; 