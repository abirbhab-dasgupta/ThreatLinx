import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";

// Keep the configured model first. A retired/inaccessible model (HTTP 404)
// may use the explicitly configurable, live-validated lightweight fallback.
// Authentication, quota and validation errors are never hidden by retries.
export async function generateExplanation(request: GenerateContentParameters) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    return await ai.models.generateContent(request);
  } catch (error) {
    const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
    const fallback = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";
    if (status !== 404 || request.model === fallback) throw error;
    return ai.models.generateContent({ ...request, model: fallback });
  }
}
