"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkouts, saveWorkout, completeWorkout, updateWorkout as updateWorkoutApi, WorkoutRecord } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useWorkouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
  });

  const createWorkout = useMutation({
    mutationFn: saveWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast({
        title: "Workout saved",
        description: "Your workout has been saved successfully.",
      });
    },
    onError: (error) => {
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