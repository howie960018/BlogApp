import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");
  return new GoogleGenAI({ apiKey });
};

export const analyzeJournalEntry = async (text: string): Promise<AIAnalysisResult> => {
  const ai = getAIClient();
  
  const prompt = `請分析這篇日記內容。
  1. 提供一個簡短的一句話摘要（繁體中文）。
  2. 判斷整體心情（例如：開心、反思、憂鬱、興奮、焦慮），請盡量回傳一個代表性的 Emoji，或單一心情詞彙。
  3. 生成最多 3 個相關標籤（Tags，繁體中文）。
  
  日記內容: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "日記的一句話摘要（繁體中文）" },
            mood: { type: Type.STRING, description: "代表心情的單一 Emoji 或詞彙" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "最多 3 個相關標籤陣列" 
            }
          },
          required: ["summary", "mood", "tags"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(resultText) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback if AI fails
    return {
      summary: "暫時無法生成摘要。",
      mood: "neutral",
      tags: ["日記"]
    };
  }
};