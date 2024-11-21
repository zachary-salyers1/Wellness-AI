"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkouts, saveWorkout, completeWorkout, updateWorkout as updateWorkoutApi, WorkoutRecord } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { Workout } from '@/types/workout';

export function useWorkouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
  });

  const createWorkout = useMutation({
    mutationFn: async (workout: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to create workouts');

      const { data, error } = await supabase
        .from('workouts')
        .insert([
          {
            title: workout.title,
            type: workout.type,
            difficulty: workout.difficulty,
            exercises: workout.exercises || [],
            completed: workout.completed,
            scheduled_date: workout.scheduled_date,
            description: workout.description || '',
            split_type: workout.split_type,
            is_rest_day: workout.is_rest_day || false,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Workout saved",
        description: "Your workout has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateWorkout = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WorkoutRecord> }) =>
      updateWorkoutApi(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Workout updated",
        description: "Your workout has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markAsComplete = useMutation({
    mutationFn: completeWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been marked as complete.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update workout status. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    workouts,
    isLoading,
    createWorkout,
    updateWorkout,
    markAsComplete,
  };
}