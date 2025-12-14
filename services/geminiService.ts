
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameLevel, LEVEL_THEMES, NPCFeedback, PlayerState } from "../types";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Schema for generating a Level
const levelSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    scenario: { type: Type.STRING, description: "Deskripsi situasi cinematic dalam 2-3 kalimat." },
    location: { type: Type.STRING },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "Teks pilihan tindakan." },
          type: { type: Type.STRING, enum: ["good", "neutral", "bad"] },
          impact: {
            type: Type.OBJECT,
            properties: {
              iman: { type: Type.INTEGER, description: "Perubahan iman (+/-)" },
              amal: { type: Type.INTEGER, description: "Poin amal (+)" },
              lalai: { type: Type.INTEGER, description: "Poin lalai (+)" }
            },
            required: ["iman", "amal", "lalai"]
          },
          feedback: { type: Type.STRING, description: "Dampak langsung singkat (1 kalimat)." }
        },
        required: ["id", "text", "type", "impact", "feedback"]
      }
    }
  },
  required: ["title", "scenario", "location", "choices"]
};

// Schema for NPC Feedback (Ustadz Hasan)
const npcSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dialogue: { type: Type.STRING, description: "Respon personal Ustadz Hasan terhadap pilihan pemain." },
    wisdom: { type: Type.STRING, description: "Kutipan hadits atau nasihat pendek yang relevan." }
  },
  required: ["dialogue", "wisdom"]
};

// Utility to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const generateLevelContent = async (levelIndex: number): Promise<GameLevel> => {
  if (!ai) throw new Error("API Key missing");

  const theme = LEVEL_THEMES[levelIndex];
  
  const prompt = `
    Kamu adalah Game Master untuk RPG Islami "Jejak Amal Harian".
    Buat level ke-${levelIndex + 1} dengan tema: "${theme}".
    
    Konteks:
    - Target: Siswa SMP.
    - Gaya Bahasa: Menarik, tidak kaku, situasi realistis sehari-hari (Relatable).
    - Format: Roblox-style scenario (visual description).
    
    Tugas:
    1. Buat skenario dilema moral yang realistis.
    2. Berikan 3 pilihan:
       - Good: Pilihan ideal (tapi mungkin sulit/tidak populer).
       - Neutral: Pilihan biasa/standar.
       - Bad: Pilihan menggoda/salah (menambah kelalaian).
    3. Tentukan impact stats secara logis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: levelSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI Empty Response");
    const data = JSON.parse(text);
    
    // Shuffle the choices so they are random every time
    if (data.choices && Array.isArray(data.choices)) {
      data.choices = shuffleArray(data.choices);
    }

    return { ...data, id: levelIndex + 1 };
  } catch (error) {
    console.error("Gemini Level Error:", error);
    throw error;
  }
};

export const generateNPCFeedback = async (
  playerState: PlayerState, 
  lastChoiceText: string,
  levelTheme: string
): Promise<NPCFeedback> => {
  if (!ai) throw new Error("API Key missing");

  const prompt = `
    Berperan sebagai Ustadz Hasan, mentor yang bijak, hangat, dan tidak menghakimi di game RPG.
    
    Situasi:
    - Pemain: ${playerState.name}
    - Tema Level: ${levelTheme}
    - Pilihan yang baru diambil pemain: "${lastChoiceText}"
    - Stats Pemain saat ini: Iman=${playerState.iman}, Amal=${playerState.amal}, Lalai=${playerState.lalai}.

    Tugas:
    1. Berikan komentar evaluasi singkat (dialogue). Jika pilihan buruk, ajak refleksi. Jika baik, apresiasi.
    2. Berikan satu "Wisdom" (kata mutiara/hadits pendek) yang relevan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: npcSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI Empty Response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini NPC Error:", error);
    // Fallback if error
    return {
      dialogue: "Hmm, pilihan yang menarik. Mari kita renungkan dampaknya bagi hati kita.",
      wisdom: "Setiap amal tergantung pada niatnya."
    };
  }
};

export const generateSceneImage = async (scenario: string): Promise<string | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a cinematic, atmospheric anime-style background art (no text, landscape orientation) for this RPG scenario: ${scenario}. The mood should be slightly dark but colorful like Mobile Legends artwork.`
          },
        ],
      },
      config: {
        // No schema for image generation
      }
    });

    // Loop through candidates to find image data
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64String = part.inlineData.data;
                return `data:image/png;base64,${base64String}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.warn("Image Generation Failed:", error);
    return null;
  }
}
