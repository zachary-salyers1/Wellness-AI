import { createClient } from '@supabase/supabase-js';
import { type WorkoutRecord } from '@/types/workout';
import { NutritionPlan, Meal } from '@/types/nutrition';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function saveWorkout(workout: Omit<WorkoutRecord, 'id' | 'created_at' | 'user_id'>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated to save workouts');

  const { data, error } = await supabase
    .from('workouts')
    .insert([{
      ...workout,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWorkouts() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated to fetch workouts');

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as WorkoutRecord[];
}

export async function updateWorkout(id: string, updates: Partial<WorkoutRecord>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated to update workouts');

  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeWorkout(id: string) {
  return updateWorkout(id, {
    completed: true,
    completion_date: new Date().toISOString(),
  });
}

export async function saveNutritionPlan(plan: Omit<NutritionPlan, 'id' | 'created_at' | 'user_id'>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated to save nutrition plans');

  const { data, error } = await supabase
    .from('nutrition_plans')
    .insert([{
      ...plan,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNutritionPlans() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated to fetch nutrition plans');

  const { data, error } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as NutritionPlan[];
}

export async function updateNutritionPlan(id: string, updates: Partial<NutritionPlan>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated to update nutrition plans');

  const { data, error } = await supabase
    .from('nutrition_plans')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}