import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates VBA code based on a user's natural language request.
 * Can optionally take previous code and a refinement instruction to edit existing macros.
 */
export const generateExcelMacro = async (userPrompt: string, previousCode?: string): Promise<string> => {
  try {
    let systemPrompt = "";

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
        2. Kodun bütünlüğünü bozma, sadece istenen yerleri değiştir veya ekle.
        3. Yorum satırlarını güncelle.
      `;
    } else {
      // New Generation Mode
      systemPrompt = `
        Sen dünyanın en iyi Excel VBA (Macro) geliştiricisisin.
        Kullanıcı sana Excel'de ne yapmak istediğini söyleyecek.
        Senin görevin bu işi yapan kusursuz, hatasız ve iyi yorumlanmış bir VBA kodu yazmaktır.

        Kurallar:
        1. SADECE VBA kodunu döndür. Başka bir açıklama, sohbet veya markdown ('''vba) ekleme.
        2. Kodun başına ne işe yaradığını anlatan yorum satırları ekle (Türkçe).
        3. "Hata Ayıklama" (Error Handling) mekanizması ekle (On Error GoTo...).
        4. Kodun modüler ve temiz olsun.
        5. Eğer kullanıcı tehlikeli bir şey isterse (dosya silme vb.) reddet ve yorum satırı olarak uyarı yaz.
        
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
 * Fetches the live USD/TRY exchange rate using Google Search grounding.
 */
export const getLiveExchangeRate = async (): Promise<{ rate: string; source: string }> => {
  try {
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
      if (webChunk?.web) {
        source = webChunk.web.title || new URL(webChunk.web.uri).hostname;
      }
    }

    return { rate, source };
  } catch (error) {
    console.error("Kur bilgisi alınamadı:", error);
    throw error;
  }
};