import type { WithSpringConfig } from "react-native-reanimated";

// Critically damped (damping ≈ 2·√(stiffness·mass)) so the sheet settles
// without overshooting its snap point; the clamp covers fast flings too.
export const DEFAULT_SPRING: WithSpringConfig = {
  damping: 30,
  stiffness: 240,
  mass: 0.9,
  overshootClamping: true,
};

export const DEFAULT_TOP_GAP = 12;
export const DEFAULT_VELOCITY_FACTOR = 0.15;

export const STAGE_SCALE = 0.91;
export const STAGE_RADIUS = 14;
export const STAGE_DIM = 0.35;

export const STACK_SCALE = 0.96;
export const STACK_PEEK = 10;

export const ABSOLUTE_FILL = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

export const SHEET_RADIUS = 20;
export const HANDLE_WIDTH = 40;
export const HANDLE_HEIGHT = 4;

export const SHEET_PADDING = 20;
export const SHEET_CONTENT_GAP = 20;
export const SHEET_TITLE_SIZE = 18;

export const COLORS = {
  sheet: "#FFFFFF",
  handle: "#D1D5DB",
  dim: "#000000",
  backdrop: "#000000",
  stage: "#FFFFFF",
  background: "#F3F4F6",
} as const;
