
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardAnalysis } from "../types";

export const analyzeDataset = async (
  schema: string[],
  sampleData: any[]
): Promise<DashboardAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a World-Class Data Scientist and BI Expert. 
    Analyze this dataset schema and sample rows.
    Schema: ${JSON.stringify(schema)}
    Sample Data: ${JSON.stringify(sampleData)}

    Your task:
    1. Provide a concise executive summary of what this dataset represents.
    2. Identify the most critical Business KPIs (Key Performance Indicators) that can be derived from this data.
    3. Suggest professional visualizations (Charts) to represent trends, distributions, and comparisons.
    4. Provide 3 deep analytical insights based on the columns provided.

    Constraints:
    - Return valid JSON matching the schema provided.
    - Suggest charts that use existing column names as xAxisKey and yAxisKey.
    - For KPIs, specify the numeric column to aggregate and the method (sum, avg, etc.).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
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
                aggregation: { 
                  type: Type.STRING,
                  description: "Must be sum, avg, count, max, or min"
                },
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
                type: { 
                  type: Type.STRING,
                  description: "Must be BAR, LINE, PIE, AREA, or SCATTER"
                },
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

  const text = response.text;
  try {
    return JSON.parse(text) as DashboardAnalysis;
  } catch (e) {
    console.error("Failed to parse Gemini response", e, text);
    throw new Error("Analysis engine returned invalid format.");
  }
};
