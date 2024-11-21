"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { generateWorkout, initGroq } from "@/lib/groq";
import { useWorkouts } from "@/hooks/use-workouts";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const workoutFormSchema = z.object({
  type: z.enum(["strength", "cardio", "flexibility", "custom"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().min(15).max(120),
  equipment: z.array(z.string()),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

const MOCK_WORKOUT = {
  title: "Full Body Strength Training",
  description: "A comprehensive full-body workout focusing on major muscle groups",
  exercises: [
    {
      name: "Push-ups",
      sets: 3,
      reps: 12,
      notes: "Keep core tight, lower chest to ground"
    },
    {
      name: "Bodyweight Squats",
      sets: 3,
      reps: 15,
      notes: "Keep weight in heels, knees tracking over toes"
    },
    {
      name: "Dumbbell Rows",
      sets: 3,
      reps: 12,
      notes: "Keep back straight, squeeze shoulder blades"
    }
  ]
};

export function WorkoutGenerator({ onGenerate }: { onGenerate: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkout } = useWorkouts();
  const { toast } = useToast();
  const [isGroqInitialized, setIsGroqInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate workouts.",
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

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      type: "strength",
      difficulty: "beginner",
      duration: 45,
      equipment: ["dumbbells", "bodyweight"],
    },
  });

  async function onSubmit(data: WorkoutFormValues) {
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

      let workout;
      
      if (isGroqInitialized) {
        workout = await generateWorkout({
          type: data.type,
          difficulty: data.difficulty,
          duration: data.duration,
          equipment: data.equipment,
        });
      } else {
        workout = MOCK_WORKOUT;
        toast({
          title: "Using Demo Mode",
          description: "Currently using mock workout data. Add GROQ API key to enable AI workout generation.",
        });
      }

      await createWorkout.mutateAsync({
        title: workout.title,
        type: data.type,
        difficulty: data.difficulty,
        exercises: workout.exercises,
        completed: false,
      });

      toast({
        title: "Success",
        description: "Workout generated and saved successfully!",
      });

      onGenerate();
    } catch (error: any) {
      console.error('Workout generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout. Please try again.",
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes): {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={15}
                  max={120}
                  step={5}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Workout"}
          </Button>
        </div>
      </form>
    </Form>
  );
}