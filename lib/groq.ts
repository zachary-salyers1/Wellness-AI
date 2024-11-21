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

export async function generateWorkout(params: {
  type: string;
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
          content: `You are a professional fitness trainer that generates workout plans in JSON format.
The JSON schema must follow this exact structure, with these specific rules:
{
  "title": "string",
  "description": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": number (use the lower number if giving a range),
      "notes": "string (include rep ranges and duration here if needed)"
    }
  ]
}

Important:
- For reps, use the lower number of any intended range (e.g., for "10-12 reps" use 10)
- For timed exercises like planks, convert to reps (e.g., "30 seconds" becomes 1 rep)
- Include the full range or time details in the notes field instead`
        },
        { 
          role: 'user', 
          content: `Generate a ${params.difficulty} level ${params.type} workout that takes ${params.duration} minutes.
Equipment available: ${params.equipment.join(', ')}.

Rules:
1. Keep exercise names simple and clear
2. Include 4-6 exercises
3. For each exercise, specify:
   - Exact numbers for sets and reps (no ranges in these fields)
   - Put any range or time information in the notes
4. Add helpful form cues in notes`
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GROQ API');
    }
    
    try {
      const workout = JSON.parse(content);
      
      // Validate the workout structure
      if (!workout.title || typeof workout.title !== 'string') {
        throw new Error('Invalid workout title');
      }
      if (!workout.description || typeof workout.description !== 'string') {
        throw new Error('Invalid workout description');
      }
      if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
        throw new Error('Invalid exercises array');
      }

      // Validate each exercise
      workout.exercises.forEach((exercise: any, index: number) => {
        if (!exercise.name || typeof exercise.name !== 'string') {
          throw new Error(`Invalid exercise name at index ${index}`);
        }
        if (typeof exercise.sets !== 'number' || exercise.sets <= 0) {
          throw new Error(`Invalid sets value at index ${index}`);
        }
        if (typeof exercise.reps !== 'number' || exercise.reps <= 0) {
          throw new Error(`Invalid reps value at index ${index}`);
        }
        if (!exercise.notes || typeof exercise.notes !== 'string') {
          throw new Error(`Invalid notes at index ${index}`);
        }
      });

      return workout;
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      throw new Error(`Invalid workout format: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error generating workout:', error);
    throw new Error(error.message || 'Failed to generate workout. Please try again.');
  }
}