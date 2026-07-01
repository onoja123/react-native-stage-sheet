import { createContext } from "react";

import type { SheetStageContextValue } from "../types";

export const SheetStageContext = createContext<SheetStageContextValue | null>(
  null,
);
