"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flame, Target, Utensils } from "lucide-react";

const metrics = [
  {
    title: "Daily Steps",
    value: "8,246",
    icon: Activity,
    description: "Goal: 10,000",
  },
  {
    title: "Calories Burned",
    value: "486",
    icon: Flame,
    description: "Goal: 500",
  },
  {
    title: "Calories Consumed",
    value: "1,840",
    icon: Utensils,
    description: "Goal: 2,000",
  },
  {
    title: "Weekly Goals",
    value: "4/5",
    icon: Target,
    description: "80% completed",
  },
];

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}