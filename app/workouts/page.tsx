import { WorkoutDashboard } from "@/components/workouts/workout-dashboard";
import { WorkoutHistory } from "@/components/workouts/workout-history";

export default function WorkoutsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workouts</h1>
      </div>
      <WorkoutDashboard />
      <WorkoutHistory />
    </div>
  );
}