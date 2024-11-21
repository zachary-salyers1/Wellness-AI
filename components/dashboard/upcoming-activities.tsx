"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Pizza } from "lucide-react";

const activities = [
  {
    type: "workout",
    title: "Upper Body Strength",
    time: "10:00 AM",
    icon: Activity,
  },
  {
    type: "meal",
    title: "Lunch - Grilled Chicken Salad",
    time: "12:30 PM",
    icon: Pizza,
  },
  {
    type: "workout",
    title: "Evening Cardio",
    time: "5:00 PM",
    icon: Activity,
  },
];

export function UpcomingActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-4 rounded-lg border p-4"
              >
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}