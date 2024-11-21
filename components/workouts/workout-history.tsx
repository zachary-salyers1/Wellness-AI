"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkouts } from "@/hooks/use-workouts";
import { format } from "date-fns";
import { WorkoutDetails } from "./workout-details";
import { WorkoutRecord } from "@/lib/supabase";

export function WorkoutHistory() {
  const { workouts, isLoading, markAsComplete, updateWorkout } = useWorkouts();
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Loading workouts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workouts?.map((workout) => (
            <div key={workout.id} className="space-y-2">
              <div
                className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent"
                onClick={() => toggleWorkout(workout.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{workout.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workout.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {workout.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsComplete.mutate(workout.id);
                      }}
                    >
                      Complete
                    </Button>
                  )}
                  {expandedWorkout === workout.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>
              {expandedWorkout === workout.id && (
                <WorkoutDetails
                  workout={workout}
                  onComplete={(id) => markAsComplete.mutate(id)}
                  onUpdate={(id, updates) => updateWorkout.mutate({ id, updates })}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}