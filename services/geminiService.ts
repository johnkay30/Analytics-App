
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardAnalysis, DatasetMetadata } from "../types";

export const analyzeDataset = async (
  datasets: DatasetMetadata[]
): Promise<DashboardAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a multi-table context for the AI - trimmed for maximum speed
  const tableContext = datasets.map(ds => ({
    tableName: ds.name,
    columns: ds.columns,
    sample: ds.data.slice(0, 3) // Reduced sample size for faster token processing
  }));

  const prompt = `
    Act as a World-Class Data Architect. Analyze these related datasets:
    ${JSON.stringify(tableContext)}

    Task:
    1. Identify relationships (Foreign Keys).
    2. Provide a Summary.
    3. Define 4-6 Cross-Table KPIs (assume JOINs on common keys).
    4. Propose 4-6 Charts (BAR, LINE, PIE, AREA).
    5. Provide 3 cross-table business insights.

    Return the analysis in JSON format. Be concise.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", // Switched to Flash for high speed
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          suggestedJoins: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          },
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
    throw new Error("Analysis engine failed to architect the relational model.");
  }
};
