import { GoogleGenAI } from "@google/genai";

// Declare process to satisfy TypeScript, though it's handled by Vite define
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

/**
 * Interface for the smart solution response
 */
export interface SmartSolution {
  type: 'FORMULA' | 'VBA' | 'SUGGESTION';
  title: string;
  content: string; // The code, formula, or list of suggestions
  explanation: string; // Brief explanation or steps
  vbaFallbackPrompt?: string; // If it's a formula, what prompt to use if user forces VBA
}

/**
 * Analyzes the user request and generates either an Excel Formula or VBA Code.
 * Returns a structured JSON object.
 */
export const generateSmartExcelSolution = async (userPrompt: string, settings: AppSettings): Promise<SmartSolution> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const langInstruction = settings.language === 'TR' 
      ? "Excel Formüllerini TÜRKÇE yaz (Örn: EĞER, DÜŞEYARA, TOPLA)." 
      : "Excel Formüllerini İNGİLİZCE (International) yaz (Örn: IF, VLOOKUP, SUM).";

    const versionInstruction = `Kullanıcı Excel ${settings.excelVersion} versiyonunu kullanıyor. Bu versiyonda olmayan fonksiyonları (Örn: Excel 2019 öncesiyse 'ÇAPRAZARA/XLOOKUP', 'METİNBİRLEŞTİR/TEXTJOIN' vb.) ASLA kullanma. Daha eski ve uyumlu alternatifler kullan.`;

    const systemPrompt = `
      Sen dünyanın en iyi Excel uzmanısın. Kullanıcının isteğini analiz et.
      
      KULLANICI AYARLARI (ÇOK ÖNEMLİ):
      1. ${langInstruction}
      2. ${versionInstruction}

      KARAR MEKANİZMASI (ÖNCELİK SIRASI):
      1. ANLAMSIZ/ALAKASIZ GİRDİ: Eğer girdi Excel ile alakasızsa (örn: "selam", "hava durumu", "nasılsın") veya rastgele harflerse, type olarak 'SUGGESTION' döndür.
      2. FORMÜL (Yüksek Öncelik): Eğer istek standart Excel formülleriyle çözülebiliyorsa 'FORMULA' seç. VBA kullanma.
      3. VBA: Sadece formülle yapılması imkansızsa veya kullanıcı "makro" istediyse 'VBA' seç.
      
      ÇIKTI FORMATI (JSON):
      {
        "type": "FORMULA" | "VBA" | "SUGGESTION",
        "title": "Kısa başlık",
        "content": "Kod, Formül veya Öneriler Listesi",
        "explanation": "Açıklama",
        "vbaFallbackPrompt": "Formula ise VBA için prompt"
      }

      DETAYLAR:
      - Type 'SUGGESTION' ise: 'content' alanına virgülle ayrılmış 3-4 öneri yaz.
      - Type 'FORMULA' ise: Ayarlara uygun dilde formül yaz. Ayıraç olarak noktalı virgül (;) kullan.
      - Type 'VBA' ise: Hata yönetimi içeren tam Sub prosedürü yaz. VBA dili her zaman İngilizcedir (Keywords), ancak yorum satırlarını Türkçe yaz.
      
      Kullanıcı İsteği: "${userPrompt}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const jsonResponse = JSON.parse(text) as SmartSolution;
    
    return jsonResponse;

  } catch (error) {
    console.error("Akıllı çözüm üretilemedi:", error);
    // Fallback to VBA generation logic if JSON fails
    return {
      type: 'VBA',
      title: 'Otomatik Makro',
      content: await generateExcelMacro(userPrompt, settings),
      explanation: 'İsteğiniz üzerine oluşturulan VBA makrosu.'
    };
  }
};

/**
 * Generates VBA code based on a user's natural language request.
 */
export const generateExcelMacro = async (userPrompt: string, settings: AppSettings, previousCode?: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const versionNote = `Kullanıcı Excel ${settings.excelVersion} kullanıyor. Kodun bu versiyonla tam uyumlu olduğundan emin ol.`;

    const errorHandlingInstructions = `
      ZORUNLU KOD YAPISI:
      1. Performans ayarlarını (ScreenUpdating vb.) kapatıp aç.
      2. "On Error GoTo ErrorHandler" kullan.
      3. Değişken tanımlamalarını (Dim) eksiksiz yap.
      4. ${versionNote}
      5. Kod içindeki yorum satırları TÜRKÇE olsun.
    `;

    let systemPrompt = "";

    if (previousCode) {
      systemPrompt = `
        GÖREV: Mevcut VBA kodunu güncelle.
        MEVCUT KOD: ${previousCode}
        İSTEK: "${userPrompt}"
        KURALLAR: ${errorHandlingInstructions}
        Sadece kodu döndür.
      `;
    } else {
      systemPrompt = `
        Sen Excel VBA uzmanısın.
        Kullanıcı İsteği: "${userPrompt}"
        KURALLAR: 
        - SADECE VBA kodunu döndür. Markdown yok.
        - ${errorHandlingInstructions}
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    let code = response.text || "";
    code = code.replace(/```vba/g, '').replace(/```/g, '').trim();
    
    return code;
  } catch (error) {
    console.error("VBA oluşturulamadı:", error);
    throw new Error("VBA kodu oluşturulamadı.");
  }
};

/**
 * Fetches the local weather based on internet location using Google Search.
 */
export const getLocalWeather = async (): Promise<{ temp: string; condition: string; location: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // We rely on Google Search to infer the location from the IP/Request
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "What is the current weather? Return a string in this EXACT format: 'Location|Temperature(with unit)|Condition'. Example: 'Istanbul|15°C|Cloudy'. Do not add any other text.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const parts = text.split('|');
    
    if (parts.length >= 3) {
        return {
            location: parts[0].trim(),
            temp: parts[1].trim(),
            condition: parts[2].trim()
        };
    }

    // Fallback parsing if format is slightly off
    return {
        location: "Konum",
        temp: text.match(/(\d+[°C|°F]+)/)?.[0] || "--",
        condition: text.split(' ')[0] || "Bilinmiyor"
    };

  } catch (error) {
    console.error("Hava durumu alınamadı:", error);
    throw error;
  }
};

/**
 * Fetches the live USD/TRY exchange rate using Google Search grounding.
 */
export const getLiveExchangeRate = async (): Promise<{ rate: string; source: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "What is the current USD to TRY (Turkish Lira) exchange rate? Return a string in this EXACT format: 'RATE|SOURCE'. Example: '32.50|Google Finance'. Just the number for rate. Do not add any other text.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const parts = text.split('|');
    
    // Attempt to get source from grounding metadata
    let source = "Google Search";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
        const firstWeb = groundingChunks.find(c => c.web?.title);
        if (firstWeb?.web?.title) {
            source = firstWeb.web.title;
        }
    }

    if (parts.length >= 2) {
        return {
            rate: parts[0].trim(),
            source: parts[1].trim() || source
        };
    }

    // Fallback parsing
    const rateMatch = text.match(/(\d+[.,]\d+)/);
    return {
        rate: rateMatch ? rateMatch[0] : "---",
        source: source
    };

  } catch (error) {
    console.error("Kur bilgisi alınamadı:", error);
    throw error;
  }
};