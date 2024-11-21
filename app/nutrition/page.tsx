import { NutritionDashboard } from "@/components/nutrition/nutrition-dashboard";

export default function NutritionPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nutrition</h1>
      </div>
      <NutritionDashboard />
    </div>
  );
} 