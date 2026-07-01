import { Text, View } from "react-native";

import { SHEET_CONTENT_GAP, SHEET_PADDING } from "../../constants";
import type { StageSheetProps } from "../../types";
import { styles } from "./styles";

export function StageSheet({
  title,
  height,
  bottomInset,
  contentGap = SHEET_CONTENT_GAP,
  padding = SHEET_PADDING,
  children,
  footer,
  titleStyle,
  style,
}: StageSheetProps) {
  return (
    <View
      style={[
        styles.container,
        {
          height,
          paddingHorizontal: padding,
          paddingTop: 12,
          paddingBottom: bottomInset + padding,
        },
        style,
      ]}
    >
      <View style={{ gap: contentGap }}>
        {title ? (
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        ) : null}
        {children}
      </View>
      {footer}
    </View>
  );
}
