import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Enhances an image using Gemini to simulate high-resolution stacking and Sony color science.
 * @param base64Image The raw image data from the canvas.
 * @returns The enhanced image base64 string.
 */
export const enhanceImageWithGemini = async (base64Image: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    // Remove header if present for processing
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const modelId = 'gemini-3-pro-image-preview'; // Using the high-quality image model

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: "Enhance this image to look like a high-resolution photograph taken with a Sony A1 camera. \n" +
                  "1. Apply Sony A1 color science: rich contrast, natural skin tones, deep blacks, and vibrant but realistic colors.\n" +
                  "2. Simulate 'Pixel Shift Multi Shooting': significantly increase sharpness and resolve fine details.\n" +
                  "3. Reduce noise while preserving texture.\n" +
                  "4. Keep the aspect ratio identical.\n" +
                  "Return ONLY the enhanced image."
          },
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg'
            }
          }
        ]
      },
      config: {
        // No specific response schema needed for image-to-image usually, 
        // but we rely on the model returning an image part.
      }
    });

    // Extract image from response
    // The response structure for image generation/editing usually contains inlineData in parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;

  } catch (error) {
    console.error("Gemini enhancement failed:", error);
    return null;
  }
};