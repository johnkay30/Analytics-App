
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardAnalysis, DatasetMetadata } from "../types";

export const analyzeDataset = async (
  datasets: DatasetMetadata[]
): Promise<DashboardAnalysis> => {
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
    1. Define relationships between tables.
    2. Create a comprehensive Multi-Page Report.
    3. Identify "Dimensions" (categorical columns like Category, Region, Status) that would be effective as "Slicers" (filters).
    4. Design 3-4 distinct Report Pages (e.g., Executive, Trends, Segment Analysis).
    5. Each page must contain specific KPIs and Charts.
    6. Ensure KPIs and Charts use actual column names from the data.

    Return a strictly valid JSON object matching the requested schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: prompt,
    config: {
      responseMimeType: "application/json",
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
        required: ["summary", "kpis", "charts", "pages", "dimensions"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI engine.");
    const parsed = JSON.parse(text);
    return parsed as DashboardAnalysis;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("The analysis engine could not architect the report. Please verify your data schema.");
  }
};
