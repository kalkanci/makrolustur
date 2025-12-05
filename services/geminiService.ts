import { GoogleGenAI } from "@google/genai";

// Declare process to satisfy TypeScript, though it's handled by Vite define
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
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
 * Analyzes the generated VBA code and provides suggestions.
 */
export const getCodeSuggestions = async (code: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Sen uzman bir Code Reviewer (Kod İnceleyici) ve Eğitmensin.
      
      Aşağıdaki Excel VBA kodunu analiz et ve TÜRKÇE olarak şu formatta kısa bir rapor sun:
      
      1. **Kod Özeti**: Kodun ne yaptığını 1 cümle ile açıkla.
      2. **Geliştirme Önerileri**: Varsa performans veya mantık açısından 2-3 kısa öneri (Madde işareti ile). Yoksa "Kod gayet optimize görünüyor" yaz.
      3. **Dikkat**: Eğer potansiyel bir risk (sonsuz döngü, dosya silme vs.) varsa belirt.
      
      KOD:
      ${code}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Analiz yapılamadı.";
  } catch (error) {
    console.error("Analiz hatası:", error);
    return "Şu anda kod analizi yapılamıyor.";
  }
};

/**
 * Fetches the live USD/TRY exchange rate using Google Search grounding.
 */
export const getLiveExchangeRate = async (): Promise<{ rate: string; source: string }> => {
  try {
    // Initialize inside function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "What is the current USD to TRY exchange rate? Return just the numeric value.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const match = text.match(/(\d+[.,]\d+)/);
    const rate = match ? match[0] : text.substring(0, 10);

    let source = "Google Search";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks && chunks.length > 0) {
      const webChunk = chunks.find((c: any) => c.web);
      // Added check to ensure uri exists before passing to URL constructor to fix TS2345
      if (webChunk?.web?.uri) {
        source = webChunk.web.title || new URL(webChunk.web.uri).hostname;
      }
    }

    return { rate, source };
  } catch (error) {
    console.error("Kur bilgisi alınamadı:", error);
    throw error;
  }
};