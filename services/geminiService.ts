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
export const generateSmartExcelSolution = async (userPrompt: string): Promise<SmartSolution> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemPrompt = `
      Sen dünyanın en iyi Excel uzmanısın. Kullanıcının isteğini analiz et.
      
      KARAR MEKANİZMASI (ÖNCELİK SIRASI):
      1. ANLAMSIZ/ALAKASIZ GİRDİ: Eğer girdi Excel ile alakasızsa (örn: "selam", "hava durumu", "nasılsın") veya rastgele harflerse (örn: "asdasf"), type olarak 'SUGGESTION' döndür.
      2. FORMÜL (Yüksek Öncelik): Eğer istek standart Excel formülleriyle (EĞER, DÜŞEYARA, ETOPLA, FİLTRE vb.) çözülebiliyorsa, çözüm türü olarak 'FORMULA' seç. VBA kullanma. Kullanıcı özellikle "makro" demedikçe FORMÜL önceliklidir.
      3. VBA: Sadece formülle yapılması imkansızsa (hücre boyama, dosya kaydetme, mail atma) veya kullanıcı "makro" istediyse 'VBA' seç.
      
      ÇIKTI FORMATI (JSON):
      Aşağıdaki JSON şemasına uygun yanıt ver. Markdown kullanma, sadece saf JSON döndür.
      
      {
        "type": "FORMULA" | "VBA" | "SUGGESTION",
        "title": "Kısa başlık",
        "content": "Kod, Formül veya Öneriler Listesi",
        "explanation": "Açıklama",
        "vbaFallbackPrompt": "Formula ise VBA için prompt"
      }

      DETAYLAR:
      - Type 'SUGGESTION' ise: 'content' alanına kullanıcının Excel'de yapmak isteyebileceği 3-4 farklı işlemi (örn: "Tabloyu renklendir", "Boşlukları sil") aralarına virül koyarak string olarak yaz. 'explanation' kısmına "Ne yapmak istediğinizi tam anlayamadım, şunları deneyebilirsiniz:" yaz.
      - Type 'FORMULA' ise: Türkçe Excel formülleri kullan (IF->EĞER, ; ayracı).
      - Type 'VBA' ise: Hata yönetimi içeren tam Sub prosedürü yaz.
      
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
      ZORUNLU KOD YAPISI VE PERFORMANS AYARLARI:
      1. Kodun EN BAŞINDA (Sub tanımlamasından hemen sonra) performansı artırmak için şu ayarları kapat:
         Application.ScreenUpdating = False
         Application.EnableEvents = False
         Application.Calculation = xlCalculationManual
      
      2. Kodun EN SONUNDA (Exit Sub veya End Sub öncesi) bu ayarları MUTLAKA eski haline döndür:
         Application.ScreenUpdating = True
         Application.EnableEvents = True
         Application.Calculation = xlCalculationAutomatic

      3. Hata Yönetimi (Error Handling):
         - Kodun başında "On Error GoTo ErrorHandler" kullan.
         - Kodun sonunda, "ErrorHandler:" etiketinden önce "Exit Sub" ekle.
         - "ErrorHandler:" bloğunda, yukarıdaki Application ayarlarını (ScreenUpdating vb.) tekrar True/Automatic yap (böylece hata olsa bile Excel kilitli kalmaz) ve MsgBox ile hatayı göster.
      
      4. Kod Yapısı Örneği:
         Sub OrnekMakro()
             On Error GoTo ErrorHandler
             Application.ScreenUpdating = False
             Application.EnableEvents = False
             Application.Calculation = xlCalculationManual
             
             ' ... KODLAR BURAYA ...
             
         SafeExit:
             Application.ScreenUpdating = True
             Application.EnableEvents = True
             Application.Calculation = xlCalculationAutomatic
             Exit Sub
             
         ErrorHandler:
             MsgBox "Bir hata oluştu: " & Err.Description, vbCritical, "Hata"
             Resume SafeExit
         End Sub

      5. Okunabilirlik:
         - Her işlem adımı için Türkçe yorum satırları (') ekle.
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
        Sen dünyanın en iyi Excel VBA (Makro) geliştiricisisin.
        Kullanıcı sana Excel'de ne yapmak istediğini söyleyecek.
        Senin görevin bu işi yapan kusursuz, profesyonel, hatasız ve iyi yorumlanmış bir VBA kodu yazmaktır.

        GENEL KURALLAR:
        1. SADECE VBA kodunu döndür. Başka bir açıklama, sohbet veya markdown ('''vba) ekleme.
        2. Değişken isimlerini anlamlı (wsData, lastRow vb.) kullan.
        3. ${errorHandlingInstructions}
        
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