import { GoogleGenAI } from "@google/genai";

// Declare process to satisfy TypeScript for Vite environment
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

export interface AppSettings {
  excelVersion: string;
  language: 'TR' | 'EN';
}

export interface SmartSolution {
  type: 'FORMULA' | 'VBA' | 'SUGGESTION';
  title: string;
  content: string;
  explanation: string;
  vbaFallbackPrompt?: string;
}

// --- HELPER FUNCTIONS ---

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSafeString = (val: any) => (val ? String(val).trim() : "");

/**
 * Cleans potential Markdown wrapping from JSON strings.
 */
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- CORE SERVICES ---

/**
 * Analyzes the user request and generates either an Excel Formula or VBA Code.
 */
export const generateSmartExcelSolution = async (userPrompt: string, settings: AppSettings): Promise<SmartSolution> => {
  try {
    const ai = getAIClient();

    const langInstruction = settings.language === 'TR' 
      ? "Excel Formüllerini TÜRKÇE yaz (Örn: EĞER, DÜŞEYARA, TOPLA)." 
      : "Excel Formüllerini İNGİLİZCE (International) yaz (Örn: IF, VLOOKUP, SUM).";

    const versionInstruction = `Kullanıcı Excel ${settings.excelVersion} versiyonunu kullanıyor. Bu versiyonda olmayan fonksiyonları ASLA kullanma.`;

    const systemPrompt = `
      Sen dünyanın en iyi Excel uzmanısın. Kullanıcının isteğini analiz et.
      
      KULLANICI AYARLARI:
      1. ${langInstruction}
      2. ${versionInstruction}

      KARAR MEKANİZMASI (ÖNCELİK SIRASI):
      1. ANLAMSIZ GİRDİ: Eğer Excel ile alakasızsa type='SUGGESTION' döndür.
      2. FORMÜL (ZORUNLU ÖNCELİK): Eğer istek formülle çözülebiliyorsa KESİNLİKLE 'FORMULA' seç. Asla tembellik yapıp VBA seçme. Sadece formülün yetersiz kaldığı (döngü, dosya kaydetme vb.) durumlarda VBA seç.
      3. VBA: Sadece formülle imkansızsa veya kullanıcı açıkça "makro" istediyse 'VBA' seç.
      
      ÇIKTI FORMATI (SAF JSON):
      {
        "type": "FORMULA" | "VBA" | "SUGGESTION",
        "title": "Kısa başlık",
        "content": "Kod, Formül veya Öneriler Listesi",
        "explanation": "Açıklama",
        "vbaFallbackPrompt": "Formula ise VBA için prompt"
      }
      
      NOT: Yanıtın sadece JSON olsun. Markdown işareti ekleme.
      
      Kullanıcı İsteği: "${userPrompt}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.3 // Lower temperature for more deterministic logic choices
      }
    });

    const rawText = response.text || "{}";
    const cleanedText = cleanJsonString(rawText);
    
    return JSON.parse(cleanedText) as SmartSolution;

  } catch (error) {
    console.warn("Smart generation failed, falling back to VBA:", error);
    // Only fallback if it's a critical failure, otherwise propagate meaningful error
    return {
      type: 'VBA',
      title: 'Otomatik Makro',
      content: await generateExcelMacro(userPrompt, settings),
      explanation: 'Otomatik analiz yapılamadı, güvenlik ağı olarak VBA oluşturuldu.'
    };
  }
};

/**
 * Generates VBA code with robust error handling.
 */
export const generateExcelMacro = async (userPrompt: string, settings: AppSettings, previousCode?: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const errorHandlingRules = `
      GELİŞMİŞ HATA YÖNETİMİ KURALLARI:
      1. "On Error Resume Next" sadece zorunlu hallerde (nesne kontrolü vb.) kullan ve hemen kapat.
      2. Standart ErrorHandler yapısını kullan (IslemAdimi takibi, SafeExit bloğu).
      3. ScreenUpdating, Calculation, DisplayAlerts ayarlarını yönet ve SafeExit'te geri yükle.
      4. Değişkenler anlamlı olsun, yorumlar Türkçe olsun.
      5. Excel ${settings.excelVersion} uyumlu olsun.
    `;

    const systemPrompt = previousCode 
      ? `GÖREV: Mevcut VBA kodunu güncelle.\nMEVCUT KOD: ${previousCode}\nİSTEK: "${userPrompt}"\nKURALLAR: ${errorHandlingRules}\nSadece kodu döndür.`
      : `Sen Excel VBA uzmanısın.\nİSTEK: "${userPrompt}"\nKURALLAR:\n- SADECE VBA kodunu döndür. Markdown yok.\n- ${errorHandlingRules}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    let code = response.text || "";
    // Clean markdown manually just in case
    code = code.replace(/```vba/g, '').replace(/```/g, '').trim();
    return code;

  } catch (error) {
    console.error("VBA generation error:", error);
    throw new Error("VBA kodu oluşturulamadı. Lütfen tekrar deneyin.");
  }
};

/**
 * Fetches the local weather via Google Search grounding.
 */
export const getLocalWeather = async (): Promise<{ temp: string; condition: string; location: string }> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Current weather? Format: 'Location|Temperature(with unit)|Condition'. Example: 'Istanbul|15°C|Cloudy'. No other text.",
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = getSafeString(response.text);
    const parts = text.split('|');
    if (parts.length >= 3) {
      return { location: parts[0].trim(), temp: parts[1].trim(), condition: parts[2].trim() };
    }
    
    // Fallback logic
    return {
      location: "Konum",
      temp: text.match(/(\d+[°C|°F]+)/)?.[0] || "--",
      condition: text.split(' ')[0] || "Bilinmiyor"
    };

  } catch (error) {
    console.error("Weather fetch error:", error);
    throw error;
  }
};

/**
 * Fetches the live USD/TRY exchange rate via Google Search grounding.
 */
export const getLiveExchangeRate = async (): Promise<{ rate: string; source: string }> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Current USD to TRY rate? Format: 'RATE|SOURCE'. Example: '32.50|Google Finance'. Just number and source.",
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = getSafeString(response.text);
    const parts = text.split('|');
    let source = parts[1]?.trim() || "Google Search";
    
    // Enrich source from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks?.[0]?.web?.title) {
      source = groundingChunks[0].web.title;
    }

    return {
      rate: parts[0]?.trim() || text.match(/(\d+[.,]\d+)/)?.[0] || "---",
      source
    };

  } catch (error) {
    console.error("Exchange rate error:", error);
    throw error;
  }
};