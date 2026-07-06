import { StyleSheet } from "react-native";

import {
  ABSOLUTE_FILL,
  HANDLE_HEIGHT,
  HANDLE_WIDTH,
  SHEET_RADIUS,
} from "../../constants";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
    overflow: "hidden",
  },
  dim: {
    ...ABSOLUTE_FILL,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingTop: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    alignSelf: "center",
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
    borderRadius: HANDLE_HEIGHT / 2,
    marginBottom: 8,
  },
});
