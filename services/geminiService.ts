import { GoogleGenAI, Modality } from "@google/genai";

// This function takes the original image and a mask (both as base64 strings),
// prepares them for the Gemini API, and returns the AI-edited image.
export const removeObjectWithGemini = async (baseImage64: string, maskImage64: string): Promise<string> => {
  // In a real app, the API key would be handled securely, e.g., via an environment variable.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Create a canvas to combine the image and the mask
  const maskedImageWithTransparency = await createTransparentMaskedImage(baseImage64, maskImage64);

  // 2. Prepare the payload for Gemini API
  const imagePart = {
    inlineData: {
      data: maskedImageWithTransparency.split(',')[1], // remove the "data:image/png;base64," part
      mimeType: 'image/png',
    },
  };

  const textPart = {
    text: "Fill in the transparent area of this image based on the surrounding content to make it look natural and complete. Do not add any new objects, only complete the existing background.",
  };

  // 3. Call the Gemini API
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  // 4. Process the response and return the new image
  // FIX: Loop through response parts to find the image data, which is a more robust approach.
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("API did not return an image. " + (response.text || "No further details."));
};

// New function to remove an object based on a text prompt
export const removeObjectWithPrompt = async (baseImage64: string, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const mimeTypeMatch = baseImage64.match(/data:(image\/.+);base64,/);
  if (!mimeTypeMatch) {
      throw new Error("Invalid image data URL format");
  }
  const mimeType = mimeTypeMatch[1];

  const imagePart = {
    inlineData: {
      data: baseImage64.split(',')[1],
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `Based on the user's request, edit the image to remove the specified object. The edited area should blend seamlessly with the background. User's request: "${prompt}"`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  // FIX: Loop through response parts to find the image data, which is a more robust approach.
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("API did not return an image. " + (response.text || "No further details."));
};


// Helper function to apply the mask to the image, making the masked area transparent
async function createTransparentMaskedImage(baseImage64: string, maskImage64: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  const baseImg = await loadImage(baseImage64);
  const maskImg = await loadImage(maskImage64);

  canvas.width = baseImg.width;
  canvas.height = baseImg.height;

  // Draw the base image
  ctx.drawImage(baseImg, 0, 0);
  
  // Use 'destination-in' to keep parts of the base image that overlap with the mask,
  // but we want the opposite. So, we'll invert the mask logic.
  // A better way is to use destination-out with a filled mask.
  // The mask from the UI is black strokes on transparent.
  // We need to cut out the black strokes area.
  
  // Use globalCompositeOperation to "erase" the masked area
  ctx.globalCompositeOperation = 'destination-out';
  // FIX: Ensure mask image is scaled to fit the base image dimensions
  ctx.drawImage(maskImg, 0, 0, baseImg.width, baseImg.height);

  return canvas.toDataURL('image/png');
}

// Helper to load an image from a base64 string
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
