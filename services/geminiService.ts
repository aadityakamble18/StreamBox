
import { GoogleGenAI } from "@google/genai";

export async function analyzeMediaContent(fileName: string, frameBase64?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `Analyze this media file. 
    File Name: ${fileName}
    ${frameBase64 ? 'I have provided a visual frame from the video.' : 'This is an audio file.'}
    Please provide a concise summary of what this content likely is (genre, mood, or subject matter) based on the title and visual. 
    Keep it under 3 sentences. Be helpful like a media librarian.`;

    const parts: any[] = [{ text: prompt }];
    
    if (frameBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: frameBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "I'm not sure what this content is, but it looks interesting!";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Analysis unavailable at the moment.";
  }
}
