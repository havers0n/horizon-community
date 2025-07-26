
import { GoogleGenAI } from "@google/genai";
import type { Incident } from '../types';

// IMPORTANT: This check is for the web environment and prevents errors.
// In a real application, the API key should be handled securely on a backend.
const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateIncidentReport = async (incident: Incident): Promise<string> => {
  if (!API_KEY) {
    console.error("API_KEY is not set. Returning mock data.");
    return new Promise(resolve => setTimeout(() => resolve("This is a mock AI-generated summary because the API key is not configured. The incident involved a robbery and a subsequent pursuit, ending with the suspect's apprehension. All units performed their duties effectively."), 1500));
  }
  
  const prompt = `
    You are a professional law enforcement report writer. Based on the following incident data, generate a concise, formal incident summary suitable for an official report.
    Follow these instructions:
    1.  Start with a brief overview of the incident type and location.
    2.  Chronologically narrate the key events.
    3.  Mention the units and individuals involved.
    4.  Conclude with the outcome of the incident.
    5.  Maintain a professional and objective tone. Do not use slang or abbreviations unless they are standard police acronyms.

    **Incident Data:**

    *   **Incident Title:** ${incident.title}
    *   **Involved Units:** ${incident.involvedUnits.join(', ')}
    *   **Involved Citizens:** ${incident.involvedCitizens.join(', ')}
    *   **Event Log:**
        ${incident.events.map(e => `- ${new Date(e.timestamp).toLocaleTimeString()}: ${e.description}`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });
    return response.text || "No response generated";
  } catch (error) {
    console.error("Error generating incident report:", error);
    return "Error: Could not generate AI summary. Please check the console for details.";
  }
};
