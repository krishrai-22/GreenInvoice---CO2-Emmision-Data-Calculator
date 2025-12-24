export interface LineItem {
  item: string;
  quantity: number | null;
  unit: string;
  category: string; // 'Energy', 'OpEx', 'Raw Material', or others
  emission_factor: number | null;
  carbon_emission_kg: number | null;
  evidence_text: string;
}

export interface ESGReport {
  company_name: string;
  invoice_date: string;
  line_items: LineItem[];
  total_carbon_emission_kg: number | null;
  confidence_score: string; // 'High', 'Medium', 'Low'
}

export interface AnalysisResult {
  report: ESGReport;
  rawJson: string;
}
