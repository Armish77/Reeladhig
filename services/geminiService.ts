
import { GoogleGenAI, Type } from "@google/genai";
import { HighlightClip, VideoMetadata } from "../types";

// Always use the process.env.API_KEY directly as a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchVideoContextFromUrl = async (url: string): Promise<Partial<VideoMetadata & { category: string }>> => {
  const prompt = `Identify the video content at this URL: ${url}. 
  Provide the title, likely duration, a detailed description, and a category (e.g., 'podcast', 'nature', 'action', 'tutorial', 'vlog').`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            description: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["name", "duration", "description", "category"]
        }
      },
    });

    // Access the .text property directly
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Metadata Fetch Error:", error);
    return {
      name: "Unidentified Video",
      duration: 60,
      description: "A video from the provided URL.",
      category: "vlog"
    };
  }
};

export const analyzeVideoHighlights = async (
  meta: VideoMetadata,
  targetLanguage: string = 'English'
): Promise<HighlightClip[]> => {
  const prompt = `
    Analyze the following video and identify 3 potential viral highlight clips for social media.
    Video Name: ${meta.name}
    Video Duration: ${meta.duration}s
    Context: ${meta.description}
    Target Language: ${targetLanguage}

    For each clip, provide:
    1. A catchy title.
    2. Start and end timestamps within the range [0, ${meta.duration}].
    3. An engagement score (0-100).
    4. The subject's horizontal center position (0-100) for 9:16 reframing.
    5. A list of captions with timestamps and a flag if a word should be "highlighted".
    6. A short description of why this moment is engaging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER },
              engagementScore: { type: Type.NUMBER },
              subjectPositionX: { type: Type.NUMBER },
              description: { type: Type.STRING },
              captions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    startTime: { type: Type.NUMBER },
                    endTime: { type: Type.NUMBER },
                    text: { type: Type.STRING },
                    isHighlight: { type: Type.BOOLEAN }
                  },
                  required: ["startTime", "endTime", "text"]
                }
              }
            },
            required: ["id", "title", "startTime", "endTime", "engagementScore", "subjectPositionX", "captions"]
          }
        }
      }
    });

    // Access the .text property directly
    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const translateCaptions = async (
  clips: HighlightClip[],
  targetLang: string
): Promise<HighlightClip[]> => {
  const prompt = `
    Translate the following video captions into ${targetLang}. 
    Maintain the tone, emojis, and emphasis. 
    Return the exact same JSON structure.
    Input JSON: ${JSON.stringify(clips)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    // Access the .text property directly
    const text = response.text;
    return text ? JSON.parse(text.trim()) : clips;
  } catch (error) {
    return clips;
  }
};
