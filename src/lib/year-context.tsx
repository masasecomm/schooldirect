import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AVAILABLE_YEARS, type DataYear } from "@/lib/schools";

interface YearContextValue {
  year: DataYear;
  setYear: (year: DataYear) => void;
}

const STORAGE_KEY = "gauteng-schools-year";
const DEFAULT_YEAR: DataYear = "2024";

const YearContext = createContext<YearContextValue | undefined>(undefined);

export const YearProvider = ({ children }: { children: ReactNode }) => {
  const [year, setYearState] = useState<DataYear>(() => {
    if (typeof window === "undefined") return DEFAULT_YEAR;
    const stored = localStorage.getItem(STORAGE_KEY) as DataYear | null;
    return stored && AVAILABLE_YEARS.includes(stored) ? stored : DEFAULT_YEAR;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, year);
  }, [year]);

  return (
    <YearContext.Provider value={{ year, setYear: setYearState }}>{children}</YearContext.Provider>
  );
};

export const useYear = (): YearContextValue => {
  const ctx = useContext(YearContext);
  if (!ctx) throw new Error("useYear must be used within YearProvider");
  return ctx;
};