import { useCallback, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, STAGE_DIM, STAGE_RADIUS, STAGE_SCALE } from "../../constants";
import { SheetStageContext } from "../../contexts/SheetStageContext";
import type {
  DraggableSheetHandle,
  SheetDescriptor,
  SheetStageContextValue,
  SheetStageProviderProps,
} from "../../types";
import { DraggableSheet } from "../DraggableSheet";
import { styles } from "./styles";

export function SheetStageProvider({
  children,
  stageScale = STAGE_SCALE,
  stageRadius = STAGE_RADIUS,
  stageDim = STAGE_DIM,
  backdropColor = COLORS.backdrop,
  stageColor = COLORS.stage,
  sheetColor = COLORS.sheet,
  handleColor = COLORS.handle,
  dimColor = COLORS.dim,
  springConfig,
  velocityFactor,
}: SheetStageProviderProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const progress = useSharedValue(0);
  const [descriptor, setDescriptor] = useState<SheetDescriptor | null>(null);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<DraggableSheetHandle>(null);

  const present = useCallback((next: SheetDescriptor) => {
    setDescriptor(next);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const snapToIndex = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
  }, []);

  const handleClosed = useCallback(() => {
    progress.value = 0;
    setOpen(false);
    setDescriptor((current) => {
      current?.onClose?.();
      return null;
    });
  }, [progress]);

  const value = useMemo<SheetStageContextValue>(
    () => ({ progress, present, close, snapToIndex }),
    [progress, present, close, snapToIndex],
  );

  const stageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [1, stageScale],
      Extrapolation.CLAMP,
    );
    const radius = interpolate(
      progress.value,
      [0, 1],
      [0, stageRadius],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      progress.value,
      [0, 1],
      [0, insets.top - (screenHeight * (1 - stageScale)) / 2],
      Extrapolation.CLAMP,
    );
    return { borderRadius: radius, transform: [{ translateY: ty }, { scale }] };
  });

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 1],
      [0, stageDim],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <SheetStageContext.Provider value={value}>
      <View style={[styles.root, { backgroundColor: backdropColor }]}>
        <Animated.View
          style={[styles.stage, { backgroundColor: stageColor }, stageStyle]}
        >
          {children}
          <Animated.View
            pointerEvents="none"
            style={[styles.dim, { backgroundColor: dimColor }, dimStyle]}
          />
        </Animated.View>
        {descriptor ? (
          <DraggableSheet
            ref={sheetRef}
            stageProgress={progress}
            open={open}
            onClose={handleClosed}
            snapPoints={descriptor.snapPoints}
            initialSnapIndex={descriptor.initialSnapIndex}
            springConfig={descriptor.springConfig ?? springConfig}
            velocityFactor={descriptor.velocityFactor ?? velocityFactor}
            sheetColor={sheetColor}
            handleColor={handleColor}
            dimColor={dimColor}
          >
            {descriptor.render({ close })}
          </DraggableSheet>
        ) : null}
      </View>
    </SheetStageContext.Provider>
  );
}
