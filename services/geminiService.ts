import { GoogleGenAI } from "@google/genai";

// Declare process to satisfy TypeScript, though it's handled by Vite define
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

/**
 * Interface for the smart solution response
 */
export interface SmartSolution {
  type: 'FORMULA' | 'VBA';
  title: string;
  content: string; // The code or the formula
  explanation: string; // Brief explanation or steps
  vbaFallbackPrompt?: string; // If it's a formula, what prompt to use if user forces VBA
}

/**
 * Analyzes the user request and generates either an Excel Formula or VBA Code.
 * Returns a structured JSON object.
 */
export const generateSmartExcelSolution = async (userPrompt: string): Promise<SmartSolution> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemPrompt = `
      Sen dünyanın en iyi Excel uzmanısın. Kullanıcının isteğini analiz et.
      
      KARAR MEKANİZMASI:
      1. Eğer kullanıcının isteği standart Excel formülleriyle (SUM, VLOOKUP, IF, XLOOKUP, TEXTJOIN vb.) çözülebiliyorsa, çözüm türü olarak 'FORMULA' seç.
      2. Eğer istek otomasyon, dosya işlemi, döngü veya karmaşık veri manipülasyonu gerektiriyorsa 'VBA' seç.
      
      ÇIKTI FORMATI (JSON):
      Aşağıdaki JSON şemasına uygun yanıt ver. Markdown kullanma, sadece saf JSON döndür.
      
      {
        "type": "FORMULA" veya "VBA",
        "title": "Kısa ve açıklayıcı bir başlık (örn: Düşeyara ile Veri Çekme)",
        "content": "Excel Formülü veya VBA Kodu buraya",
        "explanation": "Formül ise: Nasıl kullanılacağı ve ne yaptığı (kısa madde işaretli). VBA ise: Kodun kısa özeti.",
        "vbaFallbackPrompt": "Eğer çözüm FORMULA ise, kullanıcının bu işlemi VBA ile yapması için gereken teknik prompt ifadesi. Eğer çözüm zaten VBA ise boş bırak."
      }

      ÖNEMLİ KURALLAR:
      - Formüller Türkçe Excel uyumlu olsun (örn: IF yerine EĞER, VLOOKUP yerine DÜŞEYARA). Noktalı virgül (;) kullan.
      - VBA kodu ise, önceki kurallara uygun (Error Handling, Comments) tam bir Sub prosedürü olsun.
      
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
      content: await generateExcelMacro(userPrompt),
      explanation: 'İsteğiniz üzerine oluşturulan VBA makrosu.'
    };
  }
};

/**
 * Generates VBA code based on a user's natural language request.
 * Can optionally take previous code and a refinement instruction to edit existing macros.
 */
export const generateExcelMacro = async (userPrompt: string, previousCode?: string): Promise<string> => {
  try {
    // Initialize inside function to prevent crash on app load if key is missing
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let systemPrompt = "";

    const errorHandlingInstructions = `
      ZORUNLU KOD YAPISI KURALLARI:
      1. Her prosedür (Sub) mutlaka "On Error GoTo ErrorHandler" ile başlamalıdır.
      2. Kodun en başında performans için:
         Application.ScreenUpdating = False
         Application.EnableEvents = False
         Application.Calculation = xlCalculationManual
      3. Kodun sonunda (Exit Sub öncesi) bu ayarlar mutlaka eski haline döndürülmelidir (True/Automatic).
      4. "ErrorHandler:" etiketi prosedürün en sonunda yer almalı ve kullanıcıya "MsgBox" ile anlaşılır, Türkçe bir hata mesajı göstermelidir.
      5. Hata mesajı formatı: MsgBox "Bir hata oluştu: " & Err.Description, vbCritical, "Hata"
      6. OKUNABİLİRLİK: Her Döngü (For, Do, While) ve Koşul (If, Select Case) bloğunun başlangıcına ve bitişine ne yaptığını anlatan yorum satırları ekle.
         Örnek:
         ' --- Döngü Başlangıcı: Satırları Tara ---
         For i = 1 To lastRow
            ' ... kodlar ...
         Next i
         ' --- Döngü Sonu ---
    `;

    if (previousCode) {
      // Refinement Mode
      systemPrompt = `
        Sen uzman bir Excel VBA geliştiricisisin.
        
        GÖREV: Aşağıdaki MEVCUT VBA kodunu, kullanıcının istediği değişikliklere göre GÜNCELLE.
        
        MEVCUT KOD:
        ${previousCode}
        
        KULLANICI DEĞİŞİKLİK İSTEĞİ:
        "${userPrompt}"
        
        KURALLAR:
        1. SADECE güncellenmiş VBA kodunu döndür.
        2. Kodun bütünlüğünü bozma.
        3. ${errorHandlingInstructions}
      `;
    } else {
      // New Generation Mode
      systemPrompt = `
        Sen dünyanın en iyi Excel VBA (Macro) geliştiricisisin.
        Kullanıcı sana Excel'de ne yapmak istediğini söyleyecek.
        Senin görevin bu işi yapan kusursuz, profesyonel, hatasız ve iyi yorumlanmış bir VBA kodu yazmaktır.

        GENEL KURALLAR:
        1. SADECE VBA kodunu döndür. Başka bir açıklama, sohbet veya markdown ('''vba) ekleme.
        2. Değişken isimlerini anlamlı ve İngilizce/Türkçe karışık olmadan tutarlı kullan (örn: wsSheet, lastRow).
        3. Her önemli adımda Türkçe yorum satırı ekle.
        
        ${errorHandlingInstructions}
        
        Eğer kullanıcı tehlikeli bir şey isterse (C: sürücüsünü formatla vb.) reddet ve yorum satırı olarak uyarı yaz.
        
        Kullanıcı İsteği: "${userPrompt}"
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    let code = response.text || "";
    // Clean up markdown code blocks
    code = code.replace(/```vba/g, '').replace(/```/g, '').trim();
    
    return code;
  } catch (error) {
    console.error("VBA oluşturulamadı:", error);
    throw new Error("VBA kodu oluşturulamadı. Lütfen tekrar deneyin.");
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
