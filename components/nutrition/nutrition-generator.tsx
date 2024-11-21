"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateNutritionPlan, initGroq } from '@/lib/groq';
import { useNutrition } from '@/hooks/use-nutrition';

const nutritionFormSchema = z.object({
  targetCalories: z.number().min(1200).max(5000),
  mealsPerDay: z.number().min(3).max(6),
  dietType: z.enum(["balanced", "lowCarb", "highProtein", "vegetarian", "vegan", "keto"]),
  allergies: z.array(z.string()),
  preferences: z.array(z.string()),
  preparationTime: z.number().min(15).max(120),
});

type NutritionFormValues = z.infer<typeof nutritionFormSchema>;

const MOCK_NUTRITION_PLAN = {
  title: "Balanced Nutrition Plan",
  description: "A well-balanced meal plan focused on whole foods",
  targetCalories: 2000,
  meals: [
    {
      name: "Healthy Breakfast Bowl",
      description: "Nutrient-rich breakfast to start your day",
      mealType: "breakfast",
      ingredients: [
        "1 cup oatmeal",
        "1 banana",
        "2 tbsp honey",
        "1/4 cup almonds"
      ],
      servingSize: "1 bowl",
      macros: {
        protein: 15,
        carbohydrates: 65,
        fats: 12,
        calories: 428
      },
      preparationTime: 15,
      instructions: [
        "Cook oatmeal according to package instructions",
        "Slice banana",
        "Top with honey and almonds"
      ]
    }
    // ... more meals
  ]
};

export function NutritionGenerator({ onGenerate }: { onGenerate: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGroqInitialized, setIsGroqInitialized] = useState(false);
  const { createNutritionPlan } = useNutrition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate meal plans.",
          variant: "destructive",
        });
        router.push('/auth');
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (apiKey) {
        try {
          initGroq(apiKey);
          setIsGroqInitialized(true);
        } catch (error) {
          console.error('Failed to initialize GROQ client:', error);
          setIsGroqInitialized(false);
        }
      }
    };

    checkAuth();
  }, [router, toast]);

  const form = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      targetCalories: 2000,
      mealsPerDay: 3,
      dietType: "balanced",
      allergies: [],
      preferences: [],
      preparationTime: 30,
    },
  });

  async function onSubmit(data: NutritionFormValues) {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        router.push('/auth');
        return;
      }

      let nutritionPlan;
      
      if (isGroqInitialized) {
        nutritionPlan = await generateNutritionPlan(data);
      } else {
        nutritionPlan = MOCK_NUTRITION_PLAN;
        toast({
          title: "Using Demo Mode",
          description: "Currently using mock meal plan data. Add GROQ API key to enable AI meal plan generation.",
        });
      }

      await createNutritionPlan.mutateAsync({
        title: nutritionPlan.title,
        description: nutritionPlan.description,
        target_calories: data.targetCalories,
        meals: nutritionPlan.meals,
        dietary_restrictions: data.allergies,
        preferences: data.preferences,
        target_macros: nutritionPlan.targetMacros || {
          protein: Math.round(data.targetCalories * 0.3 / 4),
          carbohydrates: Math.round(data.targetCalories * 0.4 / 4),
          fats: Math.round(data.targetCalories * 0.3 / 9),
          calories: data.targetCalories
        }
      });

      toast({
        title: "Success",
        description: "Generated your customized meal plan!",
      });

      onGenerate();
    } catch (error: any) {
      console.error('Nutrition plan generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate nutrition plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="targetCalories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Calorie Target: {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={1200}
                  max={5000}
                  step={50}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mealsPerDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meals Per Day</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of meals" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[3, 4, 5, 6].map((meals) => (
                    <SelectItem key={meals} value={meals.toString()}>
                      {meals} meals
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dietType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diet Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="lowCarb">Low Carb</SelectItem>
                  <SelectItem value="highProtein">High Protein</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Meal Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 