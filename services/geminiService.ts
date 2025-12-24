import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ESGReport, LineItem } from "../types";
import { IDP_SYSTEM_INSTRUCTION } from "../constants";

// Emission Factors Table (kg CO2 per unit)
// Moved from Prompt to Code for deterministic calculation
const EMISSION_FACTORS: Record<string, number> = {
  // Energy
  "diesel": 2.6,      // per liter
  "petrol": 2.3,      // per liter
  "gasoline": 2.3,    // per liter
  "electricity": 0.82,// per kWh
  "power": 0.82,      // per kWh
  "lpg": 1.5,         // per liter (approx)
  "gas": 2.0,         // generic gas

  // Raw Materials
  "plastic": 6.0,     // per kg
  "packaging": 6.0,   // assume plastic
  "chemicals": 3.0,   // generic chemical

  // OpEx
  "paper": 1.3,       // per kg
  "printing": 1.3,    // per kg
  "office": 1.3       // generic
};

// Define the response schema strictly to match the Interface (excluding calculated fields)
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    company_name: { type: Type.STRING, description: "Name of the company issuing the invoice" },
    invoice_date: { type: Type.STRING, description: "Date of the invoice" },
    line_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Name of the item" },
          quantity: { type: Type.NUMBER, description: "Numeric quantity" },
          unit: { type: Type.STRING, description: "Unit of measure (e.g., liters, kWh, kg)" },
          category: { type: Type.STRING, description: "ESG Category (Energy, OpEx, Raw Material)" },
          // Removed emission_factor and carbon_emission_kg from extraction schema
          evidence_text: { type: Type.STRING, description: "Exact text from invoice used as evidence" },
        },
        required: ["item", "quantity", "unit", "evidence_text"],
      },
    },
    confidence_score: { type: Type.STRING, description: "Confidence level: High, Medium, Low" },
  },
  required: ["company_name", "line_items", "confidence_score"],
};

export const analyzeDocument = async (
  fileBase64: string,
  mimeType: string
): Promise<ESGReport> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Switch to gemini-3-pro-preview for higher consistency in complex table extraction
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Process this invoice. Extract exact quantity and units. Do not calculate emissions.",
          },
        ],
      },
      config: {
        systemInstruction: IDP_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0, // strict determinism
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const rawReport = JSON.parse(text) as ESGReport;

    // Post-Processing: Calculate Emissions Deterministically in Code
    const processedLineItems: LineItem[] = (rawReport.line_items || []).map(item => {
      const searchKey = (item.item + " " + item.category).toLowerCase();
      
      // Find matching factor
      let factor = 0;
      for (const [key, value] of Object.entries(EMISSION_FACTORS)) {
        if (searchKey.includes(key)) {
          factor = value;
          break;
        }
      }

      // Default fallback for unmatched categories to avoid zero if possible
      if (factor === 0) {
        if (item.category?.toLowerCase().includes("energy")) factor = 0.82;
        if (item.category?.toLowerCase().includes("raw")) factor = 3.0;
        if (item.category?.toLowerCase().includes("opex")) factor = 1.3;
      }

      const emission = (item.quantity || 0) * factor;

      return {
        ...item,
        emission_factor: factor,
        carbon_emission_kg: emission
      };
    });

    const totalEmission = processedLineItems.reduce((sum, item) => sum + (item.carbon_emission_kg || 0), 0);

    return {
      ...rawReport,
      line_items: processedLineItems,
      total_carbon_emission_kg: totalEmission
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};