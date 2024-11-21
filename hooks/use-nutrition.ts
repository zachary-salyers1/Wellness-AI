"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNutritionPlans, saveNutritionPlan, updateNutritionPlan } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { NutritionPlan } from '@/types/nutrition';

export function useNutrition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: nutritionPlans, isLoading } = useQuery({
    queryKey: ['nutritionPlans'],
    queryFn: getNutritionPlans,
  });

  const createNutritionPlan = useMutation({
    mutationFn: async (plan: Omit<NutritionPlan, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to create nutrition plans');

      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert([{
          ...plan,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionPlans'] });
      toast({
        title: "Plan saved",
        description: "Your nutrition plan has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to save nutrition plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    nutritionPlans,
    isLoading,
    createNutritionPlan,
  };
} 