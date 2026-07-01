import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  COLORS,
  DEFAULT_SPRING,
  DEFAULT_VELOCITY_FACTOR,
  STAGE_DIM,
  STAGE_RADIUS,
  STAGE_SCALE,
} from "../../constants";
import type { DraggableSheetHandle, DraggableSheetProps } from "../../types";
import { styles } from "./styles";

export const DraggableSheet = forwardRef<
  DraggableSheetHandle,
  DraggableSheetProps
>(function DraggableSheet(
  {
    background,
    children,
    stageProgress,
    snapPoints,
    initialSnapIndex = 0,
    springConfig = DEFAULT_SPRING,
    backgroundScale = STAGE_SCALE,
    backgroundRadius = STAGE_RADIUS,
    dimOpacity = STAGE_DIM,
    velocityFactor = DEFAULT_VELOCITY_FACTOR,
    sheetStyle,
    onSnap,
    open,
    onClose,
    sheetColor = COLORS.sheet,
    handleColor = COLORS.handle,
    dimColor = COLORS.dim,
    backgroundColor = COLORS.background,
    backdropColor = COLORS.backdrop,
  },
  ref,
) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const overlay = stageProgress !== undefined;

  const snaps = useMemo(
    () => snapPoints.map((f) => f * screenHeight),
    [snapPoints, screenHeight],
  );
  const expandedY = snaps[0];
  const collapsedY = snaps[snaps.length - 1];
  const restIndex = Math.min(Math.max(initialSnapIndex, 0), snaps.length - 1);

  const translateY = useSharedValue(
    overlay || open === false ? collapsedY : snaps[restIndex],
  );
  const startY = useSharedValue(0);

  const firstRun = useRef(true);
  useEffect(() => {
    if (open === undefined) return;
    const isFirst = firstRun.current;
    firstRun.current = false;
    translateY.value = withSpring(
      open ? snaps[restIndex] : collapsedY,
      springConfig,
      (finished) => {
        if (finished && !open && !isFirst && onClose) runOnJS(onClose)();
      },
    );
  }, [open, collapsedY, restIndex, snaps, springConfig, translateY, onClose]);

  useEffect(() => {
    return () => {
      if (stageProgress) stageProgress.value = 0;
    };
  }, [stageProgress]);

  useAnimatedReaction(
    () => translateY.value,
    (ty) => {
      if (stageProgress) {
        stageProgress.value = interpolate(
          ty,
          [expandedY, collapsedY],
          [1, 0],
          Extrapolation.CLAMP,
        );
      }
    },
    [expandedY, collapsedY],
  );

  useImperativeHandle(
    ref,
    () => ({
      snapToIndex: (index: number) => {
        const i = Math.min(Math.max(index, 0), snaps.length - 1);
        translateY.value = withSpring(snaps[i], springConfig);
      },
    }),
    [snaps, springConfig, translateY],
  );

  const pan = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value =
        next < expandedY ? expandedY : next > collapsedY ? collapsedY : next;
    })
    .onEnd((e) => {
      const projected = translateY.value + velocityFactor * e.velocityY;
      let dest = snaps[0];
      let best = Math.abs(projected - snaps[0]);
      for (let i = 1; i < snaps.length; i++) {
        const d = Math.abs(projected - snaps[i]);
        if (d < best) {
          best = d;
          dest = snaps[i];
        }
      }
      translateY.value = withSpring(dest, springConfig, (finished) => {
        if (!finished) return;
        let idx = 0;
        for (let i = 0; i < snaps.length; i++) {
          if (snaps[i] === dest) idx = i;
        }
        if (onSnap) runOnJS(onSnap)(idx);
        if (onClose && idx === snaps.length - 1) runOnJS(onClose)();
      });
    });

  const backgroundStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [expandedY, collapsedY],
      [backgroundScale, 1],
      Extrapolation.CLAMP,
    );
    const radius = interpolate(
      translateY.value,
      [expandedY, collapsedY],
      [backgroundRadius, 0],
      Extrapolation.CLAMP,
    );
    const ty = interpolate(
      translateY.value,
      [expandedY, collapsedY],
      [insets.top, 0],
      Extrapolation.CLAMP,
    );
    return {
      borderRadius: radius,
      transform: [{ translateY: ty }, { scale }],
    };
  });

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [expandedY, collapsedY],
      [dimOpacity, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const card = (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.sheet,
          { height: screenHeight, backgroundColor: sheetColor },
          sheetAnimatedStyle,
          sheetStyle,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: handleColor }]} />
        {children}
      </Animated.View>
    </GestureDetector>
  );

  if (overlay) {
    return <View style={StyleSheet.absoluteFill}>{card}</View>;
  }

  return (
    <View style={[styles.root, { backgroundColor: backdropColor }]}>
      <Animated.View
        style={[styles.background, { backgroundColor }, backgroundStyle]}
      >
        {background}
        <Animated.View
          pointerEvents="none"
          style={[styles.dim, { backgroundColor: dimColor }, dimStyle]}
        />
      </Animated.View>
      {card}
    </View>
  );
});
