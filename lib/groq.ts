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

  const prompt = `Generate a ${params.difficulty} level ${params.type} workout that takes ${params.duration} minutes.
Equipment available: ${params.equipment.join(', ')}.

Return a workout plan in this exact JSON format:
{
  "title": "Workout Title",
  "description": "Brief workout description",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": number,
      "reps": number,
      "notes": "Exercise instructions"
    }
  ]
}

Rules:
1. Use ONLY the exact JSON structure shown above
2. All numbers must be actual numbers, not strings
3. All text must be in English
4. Keep exercise names simple and clear
5. Include 4-6 exercises
6. Provide practical rep and set ranges
7. Add helpful form cues in notes`;

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional fitness trainer. Always respond with valid JSON following the exact format requested.'
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1024,
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GROQ API');
    }

    // Clean the response to ensure we only parse the JSON part
    const jsonStr = content.trim().replace(/```json\n?|\n?```/g, '');
    
    try {
      const workout = JSON.parse(jsonStr);
      
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
}</content>