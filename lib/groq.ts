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
          content: `You are a professional fitness trainer that generates weekly workout plans. Return a JSON response with this exact structure:

{
  "workouts": [
    {
      "title": "Full Body Strength",
      "description": "Complete full body workout focusing on compound movements",
      "dayOfWeek": 1,
      "exercises": [
        {
          "name": "Barbell Squats",
          "sets": 4,
          "reps": 10,
          "notes": "Keep chest up, drive through heels"
        }
      ]
    }
  ]
}

Rules:
1. Each workout MUST have exactly 4-6 exercises
2. All fields are required
3. dayOfWeek must be between 1-7
4. sets and reps must be numbers
5. notes must be a string with form instructions
6. Return valid JSON that can be parsed`
        },
        { 
          role: 'user', 
          content: `Generate a ${params.daysPerWeek}-day ${params.difficulty} ${params.type} workout plan.
Split type: ${params.splitType}
Duration: ${params.duration} minutes
Equipment: ${params.equipment.join(', ')}

Requirements:
- ${params.daysPerWeek} workouts total
- 4-6 exercises per workout
- ${params.duration} minutes per workout
- Use only: ${params.equipment.join(', ')}
- For upperLower split: alternate upper/lower
- Include rest days between workouts

Return as parseable JSON matching the example format.`
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1, // Lower temperature for more consistent output
      max_tokens: 4096, // Increased for longer responses
      response_format: { type: "json_object" },
      stream: false,
      top_p: 0.95,
      frequency_penalty: 0.2
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GROQ API');
    }
    
    try {
      const response = JSON.parse(content.trim());
      
      // Validate response structure
      if (!response.workouts || !Array.isArray(response.workouts)) {
        throw new Error('Invalid response structure: missing workouts array');
      }

      // Validate each workout
      response.workouts.forEach((workout: any, index: number) => {
        if (!workout.title || !workout.description || !workout.dayOfWeek) {
          throw new Error(`Invalid workout structure at index ${index}`);
        }
        
        // Skip exercise validation for rest days
        if (workout.title.toLowerCase().includes('rest day')) {
          workout.is_rest_day = true;
          workout.exercises = [];
          return;
        }

        if (!Array.isArray(workout.exercises)) {
          throw new Error(`Missing exercises array at workout ${index + 1}`);
        }
        
        if (workout.exercises.length < 4 || workout.exercises.length > 6) {
          throw new Error(`Workout ${index + 1} must have between 4-6 exercises`);
        }

        workout.exercises.forEach((exercise: any, exIndex: number) => {
          if (!exercise.name || typeof exercise.sets !== 'number' || 
              typeof exercise.reps !== 'number' || !exercise.notes) {
            throw new Error(`Invalid exercise at workout ${index + 1}, exercise ${exIndex + 1}`);
          }
        });
      });

      if (response.workouts.length !== params.daysPerWeek) {
        throw new Error(`Expected ${params.daysPerWeek} workouts but received ${response.workouts.length}`);
      }

      return response.workouts;
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      throw new Error(`Failed to parse GROQ response: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('GROQ API Error:', error);
    if (error.error?.failed_generation) {
      console.error('Failed generation:', error.error.failed_generation);
    }
    throw new Error(error.message || 'Failed to generate workout plan');
  }
}