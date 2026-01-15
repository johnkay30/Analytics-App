
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardAnalysis } from "../types";

export const analyzeDataset = async (
  schema: string[],
  sampleData: any[]
): Promise<DashboardAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a World-Class Data Scientist. Analyze this dataset schema and sample.
    Schema: ${JSON.stringify(schema)}
    Sample Data: ${JSON.stringify(sampleData)}

    Task:
    1. Summary of dataset.
    2. Critical Business KPIs (sum, avg, count, max, min).
    3. Charts (BAR, LINE, PIE, AREA).
    4. 3 deep analytical insights.

    IMPORTANT: Be extremely concise and fast. Focus on the most impactful business metrics.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 }, // Prioritize low-latency response
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          kpis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                valueKey: { type: Type.STRING },
                aggregation: { type: Type.STRING },
                prefix: { type: Type.STRING },
                suffix: { type: Type.STRING }
              },
              required: ["id", "label", "valueKey", "aggregation"]
            }
          },
          charts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                xAxisKey: { type: Type.STRING },
                yAxisKey: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "title", "type", "xAxisKey", "yAxisKey"]
            }
          },
          insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "kpis", "charts", "insights"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as DashboardAnalysis;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Analysis engine returned invalid format.");
  }
};
