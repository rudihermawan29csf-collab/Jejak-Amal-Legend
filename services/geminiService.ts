
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

// --- FALLBACK DATA (Offline Mode / Quota Exceeded) ---
const FALLBACK_LEVEL_DATA: Record<number, Omit<GameLevel, 'id'>> = {
  0: { // Subuh
    title: "Fajar Menjelang",
    scenario: "Suara adzan Subuh sayup-sayup terdengar di tengah dinginnya pagi. Kasurmu terasa sangat nyaman dan berat untuk ditinggalkan.",
    location: "Kamar Tidur",
    choices: [
      { id: "a", text: "Lawan kantuk, wudhu air dingin, ke Masjid.", type: "good", impact: { iman: 15, amal: 20, lalai: 0 }, feedback: "Langkah beratmu diganjar pahala berlipat." },
      { id: "b", text: "Shalat di kamar saja, masih ngantuk.", type: "neutral", impact: { iman: 5, amal: 5, lalai: 0 }, feedback: "Kewajiban tertunaikan, namun kehilangan fadhilah jamaah." },
      { id: "c", text: "Tarik selimut lagi, '5 menit lagi...'", type: "bad", impact: { iman: -10, amal: 0, lalai: 15 }, feedback: "Syaitan berhasil mengikatmu dengan buhul kemalasan." }
    ]
  },
  1: { // Sekolah
    title: "Ujian Kejujuran",
    scenario: "Saat ujian berlangsung, teman sebangkumu menyodorkan kertas jawaban. Pengawas sedang lengah main HP.",
    location: "Kelas IX-A",
    choices: [
      { id: "a", text: "Tolak tegas dan kerjakan sendiri sebisanya.", type: "good", impact: { iman: 10, amal: 10, lalai: 0 }, feedback: "Kejujuran adalah mata uang yang berlaku di mana saja." },
      { id: "b", text: "Pura-pura tidak lihat.", type: "neutral", impact: { iman: 0, amal: 0, lalai: 5 }, feedback: "Diammu menyelamatkan diri, tapi tidak mengubah keadaan." },
      { id: "c", text: "Ambil contekannya, lumayan nilai bagus.", type: "bad", impact: { iman: -15, amal: 0, lalai: 10 }, feedback: "Nilai tinggi di kertas, nilai nol di mata Tuhan." }
    ]
  },
  2: { // Gadget
    title: "Notifikasi Menggoda",
    scenario: "Sedang asyik tadarus Al-Qur'an, HP bergetar terus menerus. Teman-teman mengajak 'Mabar' Rank Match.",
    location: "Ruang Tengah",
    choices: [
      { id: "a", text: "Abaikan HP, selesaikan target tadarus.", type: "good", impact: { iman: 10, amal: 15, lalai: 0 }, feedback: "Prioritasmu menentukan kualitasmu." },
      { id: "b", text: "Balas chat sebentar, lalu lanjut baca.", type: "neutral", impact: { iman: 0, amal: 5, lalai: 5 }, feedback: "Fokusmu terpecah, kekhusyukan berkurang." },
      { id: "c", text: "Langsung login game, tadarus nanti saja.", type: "bad", impact: { iman: -10, amal: 0, lalai: 15 }, feedback: "Dunia maya melalaikanmu dari dunia nyata dan akhirat." }
    ]
  },
  3: { // Sosial
    title: "Ghibah Circle",
    scenario: "Saat istirahat, teman-temanmu mulai membicarakan aib seseorang yang tidak hadir.",
    location: "Kantin Sekolah",
    choices: [
      { id: "a", text: "Ingatkan teman: 'Eh, jangan ghibah, dosa.'", type: "good", impact: { iman: 15, amal: 10, lalai: 0 }, feedback: "Mencegah kemungkaran selemah-lemahnya dengan lisan." },
      { id: "b", text: "Pergi diam-diam dari situ.", type: "neutral", impact: { iman: 5, amal: 0, lalai: 0 }, feedback: "Menghindar selamat, tapi belum tentu menyelamatkan teman." },
      { id: "c", text: "Ikut nimbrung seru, 'Eh iya kah?'", type: "bad", impact: { iman: -15, amal: 0, lalai: 10 }, feedback: "Lisanmu memakan bangkai saudaramu sendiri." }
    ]
  },
  4: { // Orang Tua
    title: "Perintah Ibu",
    scenario: "Ibu memintamu membelikan garam di warung, padahal kamu sedang capek sekali pulang sekolah.",
    location: "Dapur",
    choices: [
      { id: "a", text: "Langsung berangkat: 'Siap Bu!'", type: "good", impact: { iman: 10, amal: 20, lalai: 0 }, feedback: "Ridho Allah terletak pada ridho orang tua." },
      { id: "b", text: "Nanti dulu Bu, istirahat sebentar.", type: "neutral", impact: { iman: 0, amal: 5, lalai: 5 }, feedback: "Menunda kebaikan bisa menghilangkan keberkahan." },
      { id: "c", text: "Menggerutu: 'Ah, capek Bu!'", type: "bad", impact: { iman: -20, amal: 0, lalai: 10 }, feedback: "Satu kata 'Ah' bisa menghapus ribuan kebaikan." }
    ]
  },
  5: { // Muhasabah
    title: "Malam Renungan",
    scenario: "Malam hari sebelum tidur. Hari ini banyak kejadian berlalu.",
    location: "Kamar",
    choices: [
      { id: "a", text: "Ambil wudhu, shalat witir, istighfar.", type: "good", impact: { iman: 20, amal: 20, lalai: 0 }, feedback: "Menutup hari dengan cahaya." },
      { id: "b", text: "Langsung tidur baca doa.", type: "neutral", impact: { iman: 5, amal: 5, lalai: 0 }, feedback: "Standar yang baik." },
      { id: "c", text: "Scroll sosmed sampai ketiduran.", type: "bad", impact: { iman: -5, amal: 0, lalai: 10 }, feedback: "Waktu terbuang sia-sia hingga mimpi menjemput." }
    ]
  }
};

const GENERIC_FALLBACK: Omit<GameLevel, 'id'> = {
  title: "Tantangan Kehidupan",
  scenario: "Kamu dihadapkan pada pilihan sulit yang menguji keimananmu hari ini.",
  location: "Dunia Fana",
  choices: [
    { id: "gen1", text: "Pilih jalan ketaatan meski berat.", type: "good", impact: { iman: 10, amal: 10, lalai: 0 }, feedback: "Jalan mendaki menuju surga." },
    { id: "gen2", text: "Cari aman saja.", type: "neutral", impact: { iman: 0, amal: 5, lalai: 0 }, feedback: "Hidup mengalir tanpa arah pasti." },
    { id: "gen3", text: "Ikuti hawa nafsu sesaat.", type: "bad", impact: { iman: -10, amal: 0, lalai: 10 }, feedback: "Kesenangan sesaat, penyesalan panjang." }
  ]
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
  // Use fallback immediately if no API key, or wrapping the whole call in try/catch to fallback on API error
  
  const theme = LEVEL_THEMES[levelIndex];
  
  if (!ai) {
    console.warn("No API Key. Using Fallback Level.");
    const fallback = FALLBACK_LEVEL_DATA[levelIndex] || GENERIC_FALLBACK;
    return { ...fallback, id: levelIndex + 1 };
  }

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
    console.warn("Gemini Level Error (Falling back to offline data):", error);
    // Return Fallback Data on Error (e.g. Quota Exceeded 429)
    const fallback = FALLBACK_LEVEL_DATA[levelIndex] || GENERIC_FALLBACK;
    // Deep copy choices to avoid mutation issues if reused
    const choices = fallback.choices.map(c => ({...c}));
    return { 
        ...fallback, 
        choices: shuffleArray(choices),
        id: levelIndex + 1 
    };
  }
};

export const generateNPCFeedback = async (
  playerState: PlayerState, 
  lastChoiceText: string,
  levelTheme: string
): Promise<NPCFeedback> => {
  if (!ai) {
    return {
      dialogue: "Pilihanmu menentukan siapa dirimu. Teruslah berjuang di jalan kebaikan.",
      wisdom: "Sesungguhnya Allah bersama orang-orang yang sabar."
    };
  }

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
    console.warn("Gemini NPC Error (Falling back to offline data):", error);
    // Fallback if error
    return {
      dialogue: "Hmm, setiap langkah ada konsekuensinya. Mari kita renungkan dampaknya bagi hati kita.",
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
    console.warn("Image Generation Failed (Quota or Error):", error);
    return null;
  }
}
