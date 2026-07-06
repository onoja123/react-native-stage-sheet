import { StyleSheet } from "react-native";

import { ABSOLUTE_FILL } from "../../constants";

export const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { flex: 1, overflow: "hidden" },
  dim: { ...ABSOLUTE_FILL },
  layer: { ...ABSOLUTE_FILL },
});
