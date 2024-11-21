"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Pizza } from "lucide-react";
import Link from "next/link";

export function WelcomeHero() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">{greeting}, User!</h1>
        <p className="text-lg opacity-90 mb-6">
          Ready to continue your wellness journey?
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="secondary">
            <Link href="/workouts" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Start Workout
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/nutrition" className="flex items-center gap-2">
              <Pizza className="h-4 w-4" />
              Plan Meals
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}