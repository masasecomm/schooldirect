/**
 * Year constants extracted from `schools.ts` so consumers (e.g. YearProvider,
 * which is mounted on every page) don't transitively import the multi-MB
 * school JSON dataset.
 */
export type DataYear = "2023" | "2024" | "2025";
export const AVAILABLE_YEARS: DataYear[] = ["2025", "2024", "2023"];