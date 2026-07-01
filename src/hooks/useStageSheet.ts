import { useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DEFAULT_TOP_GAP } from "../constants";
import type { StageSheetApi, StageSheetOptions } from "../types";
import { useSheetStage } from "./useSheetStage";

export function useStageSheet() {
  const { present: presentRaw, close } = useSheetStage();
  const { height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const present = useCallback(
    ({
      render,
      topGap = DEFAULT_TOP_GAP,
      snapPoints,
      ...rest
    }: StageSheetOptions) => {
      const points = snapPoints ?? [(insets.top + topGap) / screenH, 1];
      const height = screenH * (1 - points[0]);
      presentRaw({
        ...rest,
        snapPoints: points,
        render: ({ close: dismiss }) =>
          render({
            close: dismiss,
            height,
            bottomInset: insets.bottom,
          } satisfies StageSheetApi),
      });
    },
    [presentRaw, screenH, insets.top, insets.bottom],
  );

  return { present, close };
}
