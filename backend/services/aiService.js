const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Service to handle AI generation using Google Gemini.
 */
class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generates a personalized fitness and meal plan.
   * @param {Object} userData - user profile data (age, weight, goal, etc.)
   * @returns {Object} JSON parsed plan
   */
  async generateFitnessPlan(userData) {
    const prompt = `
      You are a professional world-class fitness coach and nutritionist.
      Generate a highly personalized fitness and meal plan for a user with the following profile:
      - Age: ${userData.age}
      - Gender: ${userData.gender}
      - Weight: ${userData.weight}kg
      - Height: ${userData.height}cm
      - Activity Level: ${userData.activityLevel}
      - Goal: ${userData.goal}
      - Diet Preference: ${userData.dietPreference}

      Requirements:
      1. Provide a daily meal plan with breakfast, lunch, dinner, and snacks.
      2. Provide a weekly workout structure.
      3. List 5 foods to eat and 5 to avoid.
      4. Include hydration and sleep recommendations.
      5. The output MUST be in valid JSON format ONLY. 
      
      JSON Structure:
      {
        "mealPlan": { "breakfast": "", "lunch": "", "dinner": "", "snacks": [] },
        "workoutPlan": { "weeklyStructure": [], "keyExercises": [] },
        "recommendations": { "toEat": [], "toAvoid": [], "hydration": "", "sleep": "" }
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response from markdown code blocks if present
      const cleanedText = text.replace(/```json|```/gi, '').trim();
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('AI Generation failed: ' + error.message);
    }
  }
}

module.exports = new AIService();
