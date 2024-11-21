export type MacroNutrients = {
  protein: number;
  carbohydrates: number;
  fats: number;
  calories: number;
};

export type MicroNutrients = {
  vitamins?: {
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    // Add other vitamins as needed
  };
  minerals?: {
    iron?: number;
    calcium?: number;
    potassium?: number;
    // Add other minerals as needed
  };
};

export type Meal = {
  id?: string;
  name: string;
  description: string;
  ingredients: string[];
  servingSize: string;
  macros: MacroNutrients;
  micros?: MicroNutrients;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  preparationTime: number; // in minutes
  instructions: string[];
};

export type NutritionPlan = {
  id?: string;
  title: string;
  description: string;
  targetCalories: number;
  targetMacros: MacroNutrients;
  meals: Meal[];
  created_at?: string;
  scheduled_date?: string;
  user_id?: string;
  dietary_restrictions?: string[];
  preferences?: string[];
}; 