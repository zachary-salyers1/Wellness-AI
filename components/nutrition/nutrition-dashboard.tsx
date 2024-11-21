"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NutritionGenerator } from "./nutrition-generator";
import { Apple, UtensilsCrossed, Goal, History } from "lucide-react";
import { useNutrition } from "@/hooks/use-nutrition";
import { formatDistanceToNow } from "date-fns";

export function NutritionDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { nutritionPlans, isLoading } = useNutrition();
  
  // Get the most recent plan
  const latestPlan = nutritionPlans?.[0];
  
  // Calculate total daily targets from the latest plan
  const dailyTargets = latestPlan?.target_macros || {
    calories: 2000,
    protein: 150,
    carbohydrates: 200,
    fats: 65
  };

  // Get the latest meal from the most recent plan
  const latestMeal = latestPlan?.meals?.[latestPlan.meals.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Daily Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dailyTargets.calories.toLocaleString()} kcal
            </div>
            <p className="text-sm text-muted-foreground">Daily target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Goal className="h-5 w-5" />
              Macro Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm">
                Protein: <span className="font-bold">{dailyTargets.protein}g</span>
              </div>
              <div className="text-sm">
                Carbs: <span className="font-bold">{dailyTargets.carbohydrates}g</span>
              </div>
              <div className="text-sm">
                Fats: <span className="font-bold">{dailyTargets.fats}g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Latest Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{latestPlan?.title || "No plan yet"}</div>
            <p className="text-sm text-muted-foreground">
              {latestPlan?.created_at 
                ? formatDistanceToNow(new Date(latestPlan.created_at), { addSuffix: true })
                : "Generate your first plan"}
            </p>
          </CardContent>
        </Card>
      </div>

      {latestPlan && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Current Meal Plan</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {latestPlan.meals.map((meal, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UtensilsCrossed className="h-4 w-4" />
                    {meal.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                  <div className="text-sm">
                    <div>Calories: {meal.macros.calories} kcal</div>
                    <div>Protein: {meal.macros.protein}g</div>
                    <div>Prep time: {meal.preparationTime} mins</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full">
            Generate New Meal Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Meal Plan</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a customized meal plan based on your preferences and nutritional goals.
            </p>
          </DialogHeader>
          <NutritionGenerator onGenerate={() => setIsGenerating(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
} 