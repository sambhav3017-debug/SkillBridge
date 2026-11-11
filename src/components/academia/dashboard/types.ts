export interface AcademiaFilterState {
  department: string;
  gradYear: string;
  placementStatus: string;
  timeHorizon: string; // "all" | "academic-year" | "90d" | "30d"
}

export const INITIAL_ACADEMIA_FILTERS: AcademiaFilterState = {
  department: "All",
  gradYear: "All",
  placementStatus: "All",
  timeHorizon: "all",
};

export interface ChartDataPoint {
  label: string;
  sublabel?: string;
  value: number;
  secondaryValue?: number;
  meta?: Record<string, unknown>;
}

export interface TooltipState {
  x: number;
  y: number;
  title: string;
  value: string | number;
  details?: { label: string; value: string | number; color?: string }[];
}
