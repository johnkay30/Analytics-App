
import { GoogleGenAI, Type } from "@google/genai";
import { DashboardAnalysis, DatasetMetadata } from "../types";

export const analyzeDataset = async (
  datasets: DatasetMetadata[]
): Promise<DashboardAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a multi-table context for the AI
  const tableContext = datasets.map(ds => ({
    tableName: ds.name,
    columns: ds.columns,
    sample: ds.data.slice(0, 5)
  }));

  const prompt = `
    Act as a World-Class Data Architect and BI Specialist. 
    You are given multiple related datasets (a Relational Model).
    
    Datasets Context:
    ${JSON.stringify(tableContext)}

    Task:
    1. Identify relationships (Foreign Keys) between these tables based on column names and samples.
    2. Provide a Summary of the combined relational model.
    3. Define 4-6 Critical Cross-Table KPIs. If values exist in different tables, assume a JOIN on common keys.
    4. Propose 4-6 Professional Charts (BAR, LINE, PIE, AREA) that visualize correlations between columns of different tables.
    5. Provide 3 high-level business insights that can only be found by combining these datasets.

    Return the analysis in the specified JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Upgraded to Pro for complex relational reasoning
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          suggestedJoins: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Natural language description of how tables connect"
          },
          kpis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                valueKey: { type: Type.STRING, description: "The column name to aggregate" },
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
