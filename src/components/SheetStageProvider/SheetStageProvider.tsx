import { useCallback, useMemo, useRef, useState } from "react";
import { StatusBar, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  COLORS,
  STACK_PEEK,
  STACK_SCALE,
  STAGE_DIM,
  STAGE_RADIUS,
  STAGE_SCALE,
} from "../../constants";
import { SheetStageContext } from "../../contexts/SheetStageContext";
import type {
  DraggableSheetHandle,
  SheetDescriptor,
  SheetStageContextValue,
  SheetStageProviderProps,
} from "../../types";
import { DraggableSheet } from "../DraggableSheet";
import { styles } from "./styles";

const MAX_STACK = 4;

export function SheetStageProvider({
  children,
  stageScale = STAGE_SCALE,
  stageRadius = STAGE_RADIUS,
  stageDim = STAGE_DIM,
  stackScale = STACK_SCALE,
  stackPeek = STACK_PEEK,
  statusBarStyle = "light-content",
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

  const p0 = useSharedValue(0);
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);
  const p4 = useSharedValue(0);
  const progresses = useMemo(() => [p0, p1, p2, p3, p4], [p0, p1, p2, p3, p4]);

  const [stack, setStack] = useState<SheetDescriptor[]>([]);
  const [openFlags, setOpenFlags] = useState<boolean[]>([]);
  const stackLength = useRef(0);
  stackLength.current = stack.length;
  const sheetRefs = useRef<(DraggableSheetHandle | null)[]>([]);

  const present = useCallback((next: SheetDescriptor) => {
    setStack((s) => (s.length >= MAX_STACK ? s : [...s, next]));
    setOpenFlags((f) => (f.length >= MAX_STACK ? f : [...f, true]));
  }, []);

  const closeAt = useCallback((index: number) => {
    if (index !== stackLength.current - 1) return;
    setOpenFlags((f) =>
      index < f.length ? [...f.slice(0, index), false] : f,
    );
  }, []);

  const close = useCallback(() => {
    closeAt(stackLength.current - 1);
  }, [closeAt]);

  const snapToIndex = useCallback((index: number) => {
    sheetRefs.current[stackLength.current - 1]?.snapToIndex(index);
  }, []);

  const handleClosedAt = useCallback(
    (index: number) => {
      progresses[index].value = 0;
      setStack((s) => {
        s[index]?.onClose?.();
        return s.slice(0, index);
      });
      setOpenFlags((f) => f.slice(0, index));
    },
    [progresses],
  );

  const value = useMemo<SheetStageContextValue>(
    () => ({ progress: progresses[0], present, close, snapToIndex }),
    [progresses, present, close, snapToIndex],
  );

  const stageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progresses[0].value,
      [0, 1],
      [1, stageScale],
      Extrapolation.CLAMP,
    );
    const radius = interpolate(
      progresses[0].value,
      [0, 1],
      [0, stageRadius],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      progresses[0].value,
      [0, 1],
      [0, insets.top - (screenHeight * (1 - stageScale)) / 2],
      Extrapolation.CLAMP,
    );
    return { borderRadius: radius, transform: [{ translateY: ty }, { scale }] };
  });

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progresses[0].value,
      [0, 1],
      [0, stageDim],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <SheetStageContext.Provider value={value}>
      <View style={[styles.root, { backgroundColor: backdropColor }]}>
        {stack.length > 0 && statusBarStyle ? (
          <StatusBar animated barStyle={statusBarStyle} />
        ) : null}
        <Animated.View
          style={[styles.stage, { backgroundColor: stageColor }, stageStyle]}
        >
          {children}
          <Animated.View
            pointerEvents="none"
            style={[styles.dim, { backgroundColor: dimColor }, dimStyle]}
          />
        </Animated.View>
        {stack.map((descriptor, i) => (
          <StackLayer
            key={i}
            coveredBy={progresses[i + 1]}
            covered={i < stack.length - 1}
            topFraction={descriptor.snapPoints[0]}
            stackScale={stackScale}
            stackPeek={stackPeek}
            screenHeight={screenHeight}
          >
            <DraggableSheet
              ref={(handle) => {
                sheetRefs.current[i] = handle;
              }}
              stageProgress={progresses[i]}
              open={openFlags[i]}
              onClose={() => handleClosedAt(i)}
              snapPoints={descriptor.snapPoints}
              initialSnapIndex={descriptor.initialSnapIndex}
              springConfig={descriptor.springConfig ?? springConfig}
              velocityFactor={descriptor.velocityFactor ?? velocityFactor}
              sheetColor={sheetColor}
              handleColor={handleColor}
              dimColor={dimColor}
            >
              {descriptor.render({ close: () => closeAt(i) })}
            </DraggableSheet>
          </StackLayer>
        ))}
      </View>
    </SheetStageContext.Provider>
  );
}

function StackLayer({
  coveredBy,
  covered,
  topFraction,
  stackScale,
  stackPeek,
  screenHeight,
  children,
}: {
  coveredBy: SharedValue<number>;
  covered: boolean;
  topFraction: number;
  stackScale: number;
  stackPeek: number;
  screenHeight: number;
  children: React.ReactNode;
}) {
  const recedeStyle = useAnimatedStyle(() => {
    const sheetTop = topFraction * screenHeight;
    const scaleDrop = (screenHeight / 2 - sheetTop) * (1 - stackScale);
    const scale = interpolate(
      coveredBy.value,
      [0, 1],
      [1, stackScale],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      coveredBy.value,
      [0, 1],
      [0, -(scaleDrop + stackPeek)],
      Extrapolation.CLAMP,
    );
    return { transform: [{ translateY: ty }, { scale }] };
  });

  return (
    <Animated.View
      pointerEvents={covered ? "none" : "box-none"}
      style={[styles.layer, recedeStyle]}
    >
      {children}
    </Animated.View>
  );
}
