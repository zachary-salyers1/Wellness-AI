"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkoutGenerator } from "./workout-generator";
import { Dumbbell, History, Trophy } from "lucide-react";

export function WorkoutDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Active Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">7 days</div>
          <p className="text-sm text-muted-foreground">Keep it up!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Monthly Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">12/20</div>
          <p className="text-sm text-muted-foreground">Workouts completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Last Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">Upper Body Strength</div>
          <p className="text-sm text-muted-foreground">2 days ago</p>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="md:col-span-3">
            Generate New Workout
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Workout Plan</DialogTitle>
          </DialogHeader>
          <WorkoutGenerator onGenerate={() => setIsGenerating(true)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}