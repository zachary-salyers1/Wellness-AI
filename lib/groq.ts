"use client";

import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export function initGroq(apiKey: string) {
  if (!groqClient && apiKey) {
    groqClient = new Groq({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  return groqClient;
}

export async function generateWeeklyWorkouts(params: {
  daysPerWeek: number;
  type: string;
  splitType: string;
  difficulty: string;
  duration: number;
  equipment: string[];
}) {
  const client = groqClient;
  if (!client) {
    throw new Error('GROQ client not initialized. Please provide an API key.');
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `You are a professional fitness trainer that generates weekly workout plans. Respond with a valid JSON object containing an array of workouts. Each workout must include a title, description, dayOfWeek (1-7), and an array of exercises. Each exercise must have a name, sets, reps, and notes.

Example format:
{
  "workouts": [
    {
      "title": "Workout Title",
      "description": "Workout Description",
      "dayOfWeek": 1,
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": 10,
          "notes": "Exercise notes"
        }
      ]
    }
  ]
}`
        },
        { 
          role: 'user', 
          content: `Create a ${params.difficulty} level ${params.type} workout plan with exactly ${params.daysPerWeek} workouts.
Split type: ${params.splitType}
Duration: ${params.duration} minutes
Equipment: ${params.equipment.join(', ')}

Requirements:
- Generate exactly ${params.daysPerWeek} workouts
- For upperLower split: alternate upper and lower body workouts
- Space workouts throughout the week with rest days between
- Include 4-6 exercises per workout
- Each exercise must specify sets, reps, and form notes
- Total workout duration should be around ${params.duration} minutes`
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GROQ API');
    }
    
    try {
      const weeklyPlan = JSON.parse(content);
      
      // Validate the response structure
      if (!Array.isArray(weeklyPlan.workouts)) {
        throw new Error('Invalid workout plan structure');
      }

      // Validate each workout and its exercises
      weeklyPlan.workouts.forEach((workout: any, index: number) => {
        if (!workout.title || !workout.description || !workout.dayOfWeek || !Array.isArray(workout.exercises)) {
          throw new Error(`Invalid workout structure at index ${index}`);
        }
        
        if (workout.exercises.length < 4 || workout.exercises.length > 6) {
          throw new Error(`Workout ${index + 1} must have between 4-6 exercises`);
        }

        workout.exercises.forEach((exercise: any, exIndex: number) => {
          if (!exercise.name || typeof exercise.sets !== 'number' || 
              typeof exercise.reps !== 'number' || !exercise.notes) {
            throw new Error(`Invalid exercise structure at workout ${index + 1}, exercise ${exIndex + 1}`);
          }
        });
      });

      if (weeklyPlan.workouts.length !== params.daysPerWeek) {
        throw new Error(`Expected ${params.daysPerWeek} workouts but received ${weeklyPlan.workouts.length}`);
      }

      return weeklyPlan.workouts;
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      throw new Error(`Invalid workout format: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error generating workouts:', error);
    if (error.error?.failed_generation) {
      console.error('Failed generation details:', error.error.failed_generation);
    }
    throw new Error(error.message || 'Failed to generate workout plan. Please try again.');
  }
}