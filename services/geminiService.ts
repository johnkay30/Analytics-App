
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardAnalysis, DatasetMetadata } from "../types";

export const analyzeDataset = async (
  datasets: DatasetMetadata[]
): Promise<DashboardAnalysis> => {
  // Always create a new instance to ensure we pick up the latest injected process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const tableContext = datasets.map(ds => ({
    tableName: ds.name,
    columns: ds.columns,
    sample: ds.data.slice(0, 3)
  }));

  const prompt = `
    Act as a Senior BI Architect (Power BI/Tableau expert). Analyze these datasets:
    ${JSON.stringify(tableContext)}

    Task:
    1. Define relationships and possible JOIN keys between tables.
    2. Create a comprehensive Multi-Page Report architecture.
    3. Identify "Dimensions" (categorical columns like Category, Region, Status) that would be highly effective as "Slicers" (filters).
    4. Design 3-4 distinct Report Pages (e.g., Executive Summary, Growth Trends, Operational Deep-dive).
    5. Each page must contain specific, high-value KPIs and Charts.
    6. Ensure KPIs and Charts use ACTUAL column names found in the samples above.
    7. Provide 5-7 distinct insights in the 'insights' array.

    Return a strictly valid JSON object matching the requested schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 4000 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          dimensions: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedJoins: { type: Type.ARRAY, items: { type: Type.STRING } },
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
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                icon: { type: Type.STRING },
                kpiIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                chartIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING }
              },
              required: ["id", "title", "kpiIds", "chartIds"]
            }
          },
          insights: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "kpis", "charts", "pages", "dimensions", "insights"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("The Nexus core returned an empty response.");
    const parsed = JSON.parse(text);
    return parsed as DashboardAnalysis;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Relational mapping failed. Ensure your datasets have consistent field names or valid numeric data.");
  }
};
