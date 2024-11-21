"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkoutRecord } from "@/lib/supabase";
import { CheckCircle, Edit2, Save, X } from "lucide-react";

interface WorkoutDetailsProps {
  workout: WorkoutRecord;
  onComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WorkoutRecord>) => void;
}

export function WorkoutDetails({ workout, onComplete, onUpdate }: WorkoutDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercises, setEditedExercises] = useState(workout.exercises);

  const handleExerciseUpdate = (index: number, field: string, value: string | number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setEditedExercises(updatedExercises);
  };

  const handleSave = () => {
    onUpdate(workout.id, { exercises: editedExercises });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{workout.title}</CardTitle>
        <div className="flex gap-2">
          {!workout.completed && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onComplete(workout.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {editedExercises.map((exercise, index) => (
            <div key={index} className="space-y-2">
              <div className="font-medium">{exercise.name}</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Sets</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) =>
                        handleExerciseUpdate(index, "sets", parseInt(e.target.value))
                      }
                    />
                  ) : (
                    <div className="text-sm">{exercise.sets}</div>
                  )}
                </div>
                <div>
                  <Label>Reps</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) =>
                        handleExerciseUpdate(index, "reps", parseInt(e.target.value))
                      }
                    />
                  ) : (
                    <div className="text-sm">{exercise.reps}</div>
                  )}
                </div>
                {exercise.weight !== undefined && (
                  <div>
                    <Label>Weight (lbs)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) =>
                          handleExerciseUpdate(index, "weight", parseInt(e.target.value))
                        }
                      />
                    ) : (
                      <div className="text-sm">{exercise.weight}</div>
                    )}
                  </div>
                )}
              </div>
              {exercise.notes && (
                <div className="text-sm text-muted-foreground">{exercise.notes}</div>
              )}
            </div>
          ))}
          {isEditing && (
            <Button onClick={handleSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}