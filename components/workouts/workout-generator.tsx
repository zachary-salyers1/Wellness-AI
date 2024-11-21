"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { generateWeeklyWorkouts, initGroq } from "@/lib/groq";
import { useWorkouts } from "@/hooks/use-workouts";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const workoutFormSchema = z.object({
  daysPerWeek: z.number().min(1).max(7),
  type: z.enum(["strength", "cardio", "flexibility", "custom"]),
  splitType: z.enum(["fullBody", "upperLower", "custom"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.number().min(15).max(120),
  equipment: z.array(z.string()),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

const MOCK_WORKOUTS = [
  {
    title: "Full Body Strength Training",
    description: "A comprehensive full-body workout focusing on major muscle groups",
    dayOfWeek: 1,
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
  },
  {
    title: "Lower Body Focus",
    description: "Targeting legs and core muscles",
    dayOfWeek: 3,
    exercises: [
      {
        name: "Lunges",
        sets: 3,
        reps: 12,
        notes: "Alternate legs, keep torso upright"
      },
      {
        name: "Glute Bridges",
        sets: 3,
        reps: 15,
        notes: "Squeeze glutes at top of movement"
      },
      {
        name: "Calf Raises",
        sets: 3,
        reps: 20,
        notes: "Full range of motion"
      }
    ]
  },
  {
    title: "Upper Body Power",
    description: "Focus on upper body strength and conditioning",
    dayOfWeek: 5,
    exercises: [
      {
        name: "Dumbbell Press",
        sets: 3,
        reps: 10,
        notes: "Control the weight throughout"
      },
      {
        name: "Bent Over Rows",
        sets: 3,
        reps: 12,
        notes: "Keep back straight, pull to chest"
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: 12,
        notes: "Control the movement"
      }
    ]
  }
];

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
      daysPerWeek: 3,
      type: "strength",
      splitType: "fullBody",
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

      let workouts;
      
      if (isGroqInitialized) {
        workouts = await generateWeeklyWorkouts({
          daysPerWeek: data.daysPerWeek,
          type: data.type,
          splitType: data.splitType,
          difficulty: data.difficulty,
          duration: data.duration,
          equipment: data.equipment,
        });
      } else {
        workouts = MOCK_WORKOUTS.slice(0, data.daysPerWeek);
        toast({
          title: "Using Demo Mode",
          description: "Currently using mock workout data. Add GROQ API key to enable AI workout generation.",
        });
      }

      // Save all workouts
      for (const workout of workouts) {
        try {
          await createWorkout.mutateAsync({
            title: workout.title,
            type: data.type,
            difficulty: data.difficulty,
            exercises: workout.exercises,
            completed: false,
            scheduled_date: (() => {
              const today = new Date();
              const currentDay = today.getDay() || 7;
              const daysToAdd = (workout.dayOfWeek - currentDay + 7) % 7;
              const scheduledDate = new Date(today);
              scheduledDate.setDate(today.getDate() + daysToAdd);
              return scheduledDate.toISOString();
            })(),
            description: workout.description,
            split_type: data.splitType,
            is_rest_day: workout.is_rest_day || false,
          });
        } catch (error) {
          console.error('Error saving workout:', error);
          throw new Error('Failed to save workout to database');
        }
      }

      toast({
        title: "Success",
        description: `Generated ${workouts.length} workouts for your weekly plan!`,
      });

      onGenerate();
    } catch (error: any) {
      console.error('Workout generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate workouts. Please try again.",
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
          name="daysPerWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workouts Per Week</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select days per week" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} {days === 1 ? 'day' : 'days'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="splitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workout Split</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select split type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fullBody">Full Body</SelectItem>
                  <SelectItem value="upperLower">Upper/Lower Split</SelectItem>
                  <SelectItem value="custom">Custom Split</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

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