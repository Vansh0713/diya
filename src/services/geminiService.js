import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key exists
if (!API_KEY) {
  console.error("❌ Gemini API key is missing! Please add VITE_GEMINI_API_KEY to your .env file");
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// AI Task Management Functions
export const geminiService = {
  // Analyze task and suggest priority, category, XP
  analyzeTask: async (taskTitle, taskDescription) => {
    console.log("🔍 Analyzing task:", taskTitle);
    
    const prompt = `
      Analyze this student task and provide recommendations:
      Task: "${taskTitle}"
      Description: "${taskDescription || 'No description'}"
      
      Respond with ONLY a valid JSON object in this exact format (no extra text, no markdown):
      {
        "suggestedPriority": "medium",
        "suggestedCategory": "assignment",
        "suggestedXP": 30,
        "estimatedHours": 2,
        "studyTips": "Break this task into smaller chunks and start early",
        "relatedTopics": ["topic1", "topic2"]
      }
      
      Priority options: high, medium, low
      Category options: assignment, exam, reading, meeting, other
      XP should be between 10 and 100
      Estimated hours between 0.5 and 10
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("📝 Gemini response:", text);
      
      // Extract JSON from response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ Analysis successful:", parsed);
        return parsed;
      }
      
      // If no JSON found, return default values
      console.warn("⚠️ No JSON found in response, using defaults");
      return {
        suggestedPriority: "medium",
        suggestedCategory: "assignment",
        suggestedXP: 30,
        estimatedHours: 2,
        studyTips: "Stay focused and break down the task into smaller steps",
        relatedTopics: ["time management", "planning"]
      };
      
    } catch (error) {
      console.error("❌ Gemini analysis failed:", error);
      // Return default values instead of null
      return {
        suggestedPriority: "medium",
        suggestedCategory: "assignment",
        suggestedXP: 30,
        estimatedHours: 2,
        studyTips: "Try to complete this task in small chunks",
        relatedTopics: ["productivity", "study tips"]
      };
    }
  },

  // Break down complex task into subtasks
  breakDownTask: async (taskTitle, taskDescription) => {
    console.log("🔨 Breaking down task:", taskTitle);
    
    const prompt = `
      Break down this task into smaller, actionable subtasks:
      Task: "${taskTitle}"
      Description: "${taskDescription || 'No description'}"
      
      Return ONLY a valid JSON array (no extra text):
      [
        {
          "title": "Research the topic",
          "estimatedMinutes": 30,
          "difficulty": "easy"
        },
        {
          "title": "Create outline",
          "estimatedMinutes": 45,
          "difficulty": "medium"
        }
      ]
      Maximum 5 subtasks.
      Difficulty options: easy, medium, hard
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("📝 Subtask response:", text);
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("❌ Task breakdown failed:", error);
      return [];
    }
  },

  // Test the API connection
  testConnection: async () => {
    console.log("🔄 Testing Gemini API connection...");
    try {
      const result = await model.generateContent("Say 'API is working!'");
      const response = await result.response;
      console.log("✅ Gemini API is working:", response.text());
      return true;
    } catch (error) {
      console.error("❌ Gemini API test failed:", error);
      return false;
    }
  }
};

export default geminiService;