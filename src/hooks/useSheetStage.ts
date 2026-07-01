import { useContext } from "react";

import { SheetStageContext } from "../contexts/SheetStageContext";
import type { SheetStageContextValue } from "../types";

export function useSheetStage(): SheetStageContextValue {
  const ctx = useContext(SheetStageContext);
  if (!ctx) {
    throw new Error("useSheetStage must be used within a SheetStageProvider");
  }
  return ctx;
}
