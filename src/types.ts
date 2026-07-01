import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import type { SharedValue, WithSpringConfig } from "react-native-reanimated";

export interface SheetDescriptor {
  render: (api: { close: () => void }) => ReactNode;
  snapPoints: number[];
  initialSnapIndex?: number;
  springConfig?: WithSpringConfig;
  velocityFactor?: number;
  onClose?: () => void;
}

export interface SheetStageContextValue {
  progress: SharedValue<number>;
  present: (descriptor: SheetDescriptor) => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export interface DraggableSheetHandle {
  snapToIndex: (index: number) => void;
}

export interface StageSheetApi {
  close: () => void;
  height: number;
  bottomInset: number;
}

export interface StageSheetOptions {
  render: (api: StageSheetApi) => ReactNode;
  topGap?: number;
  snapPoints?: number[];
  initialSnapIndex?: number;
  springConfig?: WithSpringConfig;
  velocityFactor?: number;
  onClose?: () => void;
}

export interface SheetColors {
  sheetColor?: string;
  handleColor?: string;
  dimColor?: string;
}

export interface StageConfig {
  stageScale?: number;
  stageRadius?: number;
  stageDim?: number;
  backdropColor?: string;
  stageColor?: string;
}

export interface SheetStageProviderProps extends StageConfig, SheetColors {
  children: ReactNode;
}

export interface DraggableSheetProps extends SheetColors {
  children: ReactNode;
  background?: ReactNode;
  stageProgress?: SharedValue<number>;
  snapPoints: number[];
  initialSnapIndex?: number;
  springConfig?: WithSpringConfig;
  backgroundScale?: number;
  backgroundRadius?: number;
  dimOpacity?: number;
  velocityFactor?: number;
  sheetStyle?: StyleProp<ViewStyle>;
  onSnap?: (index: number) => void;
  open?: boolean;
  onClose?: () => void;
  backgroundColor?: string;
  backdropColor?: string;
}

export interface StageSheetProps {
  title?: string;
  height: number;
  bottomInset: number;
  contentGap?: number;
  padding?: number;
  children: ReactNode;
  footer?: ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}
